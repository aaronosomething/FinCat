from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import RetirementPlan, RetirementIncomeSource
from .serializers import PlanSerializer, IncomeSerializer
from user_app.views import TokenReq

class RetirementPlanView(TokenReq):
    def get(self, request):
        # get the user's plan if one exists, otherwise return an empty object
        plan = RetirementPlan.objects.filter(user=request.user).first()
        if plan:
            serializer = PlanSerializer(plan)
            return Response(serializer.data)
        # returning an empty dict is convenient for frontend code that expects an object
        return Response({}, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data.copy()
        # If a plan already exists for the user -> update it (partial update allowed).
        existing_plan = RetirementPlan.objects.filter(user=request.user).first()
        if existing_plan:
            serializer = PlanSerializer(existing_plan, data=data, partial=True)
            status_code = status.HTTP_200_OK
        else:
            serializer = PlanSerializer(data=data)
            status_code = status.HTTP_201_CREATED

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status_code)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RetirementIncomeListCreate(TokenReq):
    def get(self, request):
        income = RetirementIncomeSource.objects.filter(user=request.user)
        serializer = IncomeSerializer(income, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        serializer = IncomeSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IncomeDelete(TokenReq):
    def delete(self, request, pk):
        income = get_object_or_404(RetirementIncomeSource, id=pk, user=request.user)
        income.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RetirementIncomeBulkImport(TokenReq):
    """
    Accepts a list of { income_source, age_available, amount } objects.
    Validates via IncomeSerializer(many=True), then bulk creates new rows and bulk_updates existing ones.
    """
    def post(self, request):
        data = request.data
        if not isinstance(data, list):
            return Response({"detail": "Expected a list of incomes."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = IncomeSerializer(data=data, many=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated = serializer.validated_data
        user = request.user

        # Fetch current incomes for this user in one query and map by income_source
        existing_qs = RetirementIncomeSource.objects.filter(user=user)
        existing_map = {r.income_source: r for r in existing_qs}

        to_create = []
        to_update = []

        for item in validated:
            name = item.get("income_source")
            age_available = item.get("age_available")
            amount = item.get("amount")

            if name in existing_map:
                inst = existing_map[name]
                inst.age_available = age_available
                inst.amount = amount
                to_update.append(inst)
            else:
                to_create.append(
                    RetirementIncomeSource(
                        user=user,
                        income_source=name,
                        age_available=age_available,
                        amount=amount,
                    )
                )

        # Persist in a single transaction
        with transaction.atomic():
            if to_create:
                RetirementIncomeSource.objects.bulk_create(to_create)

            if to_update:
                # bulk_update requires a list of model instances and the fields to update
                RetirementIncomeSource.objects.bulk_update(to_update, ["age_available", "amount"])

        # Return the refreshed list of incomes (so frontend can update without extra GET)
        refreshed = RetirementIncomeSource.objects.filter(user=user)
        return Response(IncomeSerializer(refreshed, many=True).data, status=status.HTTP_200_OK)