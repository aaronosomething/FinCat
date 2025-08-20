from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Investment
from .serializers import InvestmentSerializer
from user_app.views import TokenReq
from django.db.models import Sum

class InvestmentListCreate(TokenReq):
    def get(self, request):
        investments = Investment.objects.filter(user=request.user)
        serializer = InvestmentSerializer(investments, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        data = request.data.copy()
        serializer = InvestmentSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InvestmentDetail(TokenReq):
    def get(self, request, pk):
        investment = get_object_or_404(Investment, id=pk, user=request.user)
        serializer = InvestmentSerializer(investment)
        return Response(serializer.data)

    def patch(self, request, pk):
        investment = get_object_or_404(Investment, id=pk, user=request.user)
        serializer = InvestmentSerializer(investment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        investment = get_object_or_404(Investment, id=pk, user=request.user)
        investment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class InvestmentSum(TokenReq):
    def get(self, request):
        # print("at the InvestmentSum View")
        total_value = Investment.objects.filter(user=request.user).aggregate(
            total=Sum("value")
        )["total"] or 0
        # print("total Value", total_value)
        return Response({"total_investment_value": total_value})
    

## Investment Queries

# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from datetime import datetime, timedelta
from typing import Dict, Optional

API_KEY = "2FJNUI3WOVC3VPD2" 

# Helper: find the timeseries block (keys differ for stock vs crypto responses)
def extract_timeseries(json_resp: Dict) -> Optional[Dict]:
    # look for any key that contains "Time Series" (stock) or "Time Series (Digital Currency)" (crypto)
    for k, v in json_resp.items():
        if "Time Series" in k:
            return v
    return None

# Helper: get the price number from a single timeseries row (handles common AV field names)
def price_from_row(row: Dict) -> Optional[float]:
    # common keys:
    # - TIME_SERIES_DAILY: "4. close"
    # - DIGITAL_CURRENCY_DAILY: "4a. close (USD)"
    for candidate in ("4. close", "5. adjusted close", "4a. close (USD)", "close"):
        if candidate in row:
            try:
                return float(row[candidate])
            except Exception:
                return None
    # fallback: try to find any numeric-looking value in row
    for v in row.values():
        try:
            return float(v)
        except Exception:
            continue
    return None

# Helper: given a timeseries dict keyed by "YYYY-MM-DD" strings, find the price at nearest date <= target_date
def find_price_on_or_before(timeseries: Dict[str, Dict], target_date: datetime.date) -> Optional[float]:
    # convert keys to dates and sort descending
    try:
        available_dates = sorted([datetime.strptime(d, "%Y-%m-%d").date() for d in timeseries.keys()], reverse=True)
    except Exception:
        return None
    for dt in available_dates:
        if dt <= target_date:
            row = timeseries[dt.strftime("%Y-%m-%d")]
            return price_from_row(row)
    return None

# percent change helper (returns None if cannot compute)
def pct_change(new: float, old: float) -> Optional[float]:
    try:
        if old == 0:
            return None
        return (new - old) / old * 100.0
    except Exception:
        return None

class MarketGainsAPIView(TokenReq):
    """
    GET: returns JSON with gain/loss percentages for VOO, QQQ, Dow (DIA), and Bitcoin
    over the last Day / Week / Month / Year.
    """
    def get(self, request, *args, **kwargs):
        # assets config: use TIME_SERIES_DAILY (non-premium) for ETFs, DIGITAL_CURRENCY_DAILY for BTC
        assets = {
            "VOO": {"function": "TIME_SERIES_DAILY", "symbol": "VOO"},
            "QQQ": {"function": "TIME_SERIES_DAILY", "symbol": "QQQ"},
            "DOW JONES": {"function": "TIME_SERIES_DAILY", "symbol": "DIA"},  # use DIA ETF as proxy for Dow
            "Bitcoin": {"function": "DIGITAL_CURRENCY_DAILY", "symbol": "BTC", "market": "USD"},
        }

        results = {}
        now = datetime.utcnow().date()

        for name, cfg in assets.items():
            try:
                base = "https://www.alphavantage.co/query"
                params = {
                    "function": cfg["function"],
                    "apikey": API_KEY,
                    "symbol": cfg["symbol"],
                }
                # add market for crypto
                if cfg.get("market"):
                    params["market"] = cfg["market"]

                # request more history for equities so Year target is available
                if cfg["function"].startswith("TIME_SERIES"):
                    params["outputsize"] = "full"

                resp = requests.get(base, params=params, timeout=20)
                # log exact request URL & status for server-side debugging
                print(f"[MarketGains] Requesting {resp.url} -> status {resp.status_code}")

                data = resp.json() if resp.headers.get("Content-Type", "").startswith("application/json") else None
                if data is None:
                    results[name] = {"error": "AlphaVantage returned non-JSON response.", "status_code": resp.status_code}
                    continue

                # quick diagnostics
                debug_info = {}
                for diag_key in ("Note", "Information", "Error Message"):
                    if diag_key in data:
                        debug_info[diag_key] = data.get(diag_key)

                ts = extract_timeseries(data)
                if not ts:
                    debug_info["top_level_keys"] = list(data.keys())
                    results[name] = {
                        "error": "Could not find time series in AlphaVantage response.",
                        "debug": debug_info,
                    }
                    continue

                # latest available date (most recent key)
                available_dates = sorted(ts.keys(), reverse=True)
                latest_date_str = available_dates[0]
                latest_price = price_from_row(ts[latest_date_str])
                if latest_price is None:
                    results[name] = {"error": "Couldn't parse latest price for symbol."}
                    continue

                # targets: 1 day, 7 days, 30 days, 365 days back from now (calendar days)
                targets = {
                    "Day": now - timedelta(days=1),
                    "Week": now - timedelta(days=7),
                    "Month": now - timedelta(days=30),
                    "Year": now - timedelta(days=365),
                }
                asset_out = {}
                for label, target_date in targets.items():
                    past_price = find_price_on_or_before(ts, target_date)
                    if past_price is None:
                        asset_out[label] = None
                    else:
                        asset_out[label] = round(pct_change(latest_price, past_price) or 0.0, 4)

                results[name] = {
                    "as_of": latest_date_str,
                    "latest_price": round(latest_price, 6),
                    "changes_pct": asset_out
                }
            except Exception as e:
                results[name] = {"error": f"Exception while fetching/parsing: {str(e)}"}

        return Response(results, status=status.HTTP_200_OK)