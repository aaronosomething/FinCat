from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Investment
from .serializers import InvestmentSerializer
from user_app.views import TokenReq
from django.db.models import Sum
import os
from dotenv import load_dotenv


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
        total_value = (
            Investment.objects.filter(user=request.user).aggregate(total=Sum("value"))[
                "total"
            ]
            or 0
        )
        # print("total Value", total_value)
        return Response({"total_investment_value": total_value})

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from datetime import datetime, timedelta
from typing import Dict, Optional

API_KEY = os.getenv('MARKET_KEY') 


def build_fmp_url_for_symbol(
    symbol: str, is_index: bool = False, is_crypto: bool = False
) -> str:

    base = "https://financialmodelingprep.com/api/v3"
    if is_crypto:
        return f"{base}/historical-price-eod/light/{symbol}"
    if is_index:
        return f"{base}/historical-price-full/index/{symbol}"
    return f"{base}/historical-price-full/{symbol}"


def parse_historical_to_dict(json_resp: Dict) -> Optional[Dict[str, Dict]]:
    """
    FMP historical responses have a top-level 'historical' list with entries that
    contain at least 'date' and 'close' (or 'adjClose').
    This returns a dict keyed by 'YYYY-MM-DD' -> row dict for quick lookup.
    """
    if not isinstance(json_resp, dict):
        return None
    # FMP uses key 'historical' (array of objects)
    hist = (
        json_resp.get("historical")
        or json_resp.get("historicalPrice")
        or json_resp.get("historicalData")
    )
    if not hist or not isinstance(hist, list):
        return None
    out = {}
    for row in hist:
        d = row.get("date")
        if d:
            out[d] = row
    return out if out else None


def price_from_row(row: Dict) -> Optional[float]:
    """
    Extract a numeric price from a FMP historical row. Prefer 'close', then 'adjClose', then try numeric values.
    """
    for candidate in ("close", "adjClose", "adj_close", "adjclose", "closePrice"):
        if candidate in row:
            try:
                return float(row[candidate])
            except Exception:
                return None
    # fallback: try any numeric value
    for v in row.values():
        try:
            return float(v)
        except Exception:
            continue
    return None


def find_price_on_or_before(
    timeseries: Dict[str, Dict], target_date: datetime.date
) -> Optional[float]:
    try:
        available_dates = sorted(
            [datetime.strptime(d, "%Y-%m-%d").date() for d in timeseries.keys()],
            reverse=True,
        )
    except Exception:
        return None
    for dt in available_dates:
        if dt <= target_date:
            row = timeseries.get(dt.strftime("%Y-%m-%d"))
            return price_from_row(row) if row else None
    return None


def pct_change(new: float, old: float) -> Optional[float]:
    try:
        if old == 0:
            return None
        return (new - old) / old * 100.0
    except Exception:
        return None


class MarketGainsAPIView(APIView):
    """
    GET: returns JSON with gain/loss percentages for VOO, QQQ, DOW (DIA), and Bitcoin
    over Day / Week / Month / Year. Preserves existing output shape.
    """

    def fetch_crypto_timeseries(self, symbol: str, from_date: str) -> Optional[Dict[str, Dict]]:
        """
        Fetch crypto using the FMP EOD endpoint and normalize to dict[YYYY-MM-DD] -> row.
        Returns a dict keyed by date or None on failure.
        """
        # light endpoint for eod data (documented)
        url = "https://financialmodelingprep.com/stable/historical-price-eod/light"
        params = {"symbol": symbol, "from": from_date}
        if API_KEY:
            params["apikey"] = API_KEY

        try:
            resp = requests.get(url, params=params, timeout=20)
            print(f"[MarketGains:FMP:crypto] Requesting {resp.url} -> status {resp.status_code}")
            # attempt JSON parse
            try:
                data = resp.json() if resp.headers.get("Content-Type", "").startswith("application/json") else None
            except Exception:
                data = None

            if data is None:
                return None

            rows = None
            if isinstance(data, list):
                rows = data
            elif isinstance(data, dict):
                # common: {"symbol": "BTCUSD", "historical": [...]}
                rows = data.get("historical") or data.get("data") or data.get("rows")
                if rows is None:
                    # fallback: if dict contains exactly one list value, use that
                    for v in data.values():
                        if isinstance(v, list):
                            rows = v
                            break

            if not rows or not isinstance(rows, list):
                return None

            out = {}
            for row in rows:
                if not isinstance(row, dict):
                    continue
                date_str = row.get("date") or row.get("datetime") or row.get("timestamp")
                if not date_str:
                    continue
                out[date_str] = row
            return out if out else None

        except Exception as exc:
            print(f"[MarketGains:FMP:crypto] Exception fetching crypto timeseries: {exc}")
            return None


    def get(self, request, *args, **kwargs):
        assets = {
            "VOO": {"symbol": "VOO", "type": "equity"},
            "QQQ": {"symbol": "QQQ", "type": "equity"},
            "DOW JONES": {"symbol": "DIA", "type": "equity"},  # ETF proxy
            "Bitcoin": {"symbol": "BTCUSD", "type": "crypto"},
        }

        results = {}
        now = datetime.now().date()

        for name, cfg in assets.items():
            try:
                is_crypto = cfg["type"] == "crypto"
                is_index = cfg["type"] == "index"
                symbol = cfg["symbol"]

                # --- CRYPTO PATH (only changed code) ---
                if is_crypto:
                    # Use the stable light EOD endpoint with a from param (1 year ago)
                    one_year_ago = (now - timedelta(days=365)).strftime("%Y-%m-%d")
                    ts = self.fetch_crypto_timeseries(symbol, one_year_ago)

                    if not ts:
                        results[name] = {
                            "error": "Could not find historical rows in FMP crypto light response.",
                        }
                        continue

                # --- EQUITY / ETF PATH (unchanged logic) ---
                else:
                    url = build_fmp_url_for_symbol(symbol, is_index=is_index, is_crypto=False)
                    params = {}
                    if API_KEY:
                        params["apikey"] = API_KEY
                    # keep the serietype parameter if your build expects it (harmless for equities)
                    params["serietype"] = "line"

                    resp = requests.get(url, params=params, timeout=20)
                    print(f"[MarketGains:FMP:equity] Requesting {resp.url} -> status {resp.status_code}")

                    data = None
                    try:
                        data = resp.json() if resp.headers.get("Content-Type", "").startswith("application/json") else None
                    except Exception:
                        data = None

                    if data is None:
                        results[name] = {
                            "error": "FMP returned non-JSON response for equity.",
                            "status_code": resp.status_code,
                        }
                        continue

                    # use your existing parser for equities (expects dict with 'historical' list)
                    ts = parse_historical_to_dict(data)
                    if not ts:
                        # include top-level keys for easier debugging
                        debug_keys = list(data.keys()) if isinstance(data, dict) else []
                        results[name] = {
                            "error": "Could not find 'historical' data in FMP response for equity.",
                            "debug": {"top_level_keys": debug_keys},
                        }
                        continue

                # At this point `ts` is a dict keyed by 'YYYY-MM-DD' -> row
                latest_date_str = sorted(ts.keys(), reverse=True)[0]
                latest_price = price_from_row(ts[latest_date_str])
                if latest_price is None:
                    results[name] = {"error": "Couldn't parse latest price for symbol."}
                    continue

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
                        ch = pct_change(latest_price, past_price)
                        asset_out[label] = round(ch, 4) if ch is not None else None

                results[name] = {
                    "as_of": latest_date_str,
                    "latest_price": round(latest_price, 6),
                    "changes_pct": asset_out,
                }

            except Exception as e:
                results[name] = {"error": f"Exception while fetching/parsing: {str(e)}"}

        return Response(results, status=status.HTTP_200_OK)
