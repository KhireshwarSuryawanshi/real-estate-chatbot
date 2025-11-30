import pandas as pd
from rest_framework.decorators import api_view
from rest_framework.response import Response

# import excel
df = pd.read_excel("analysis/data/clean.xlsx", engine='openpyxl')
print("LOCATIONS:", df["final location"].unique()[:50])


@api_view(["POST"])
def analyze(request):
    print("COLUMNS:", df.columns)
    query = request.data.get("query", "").strip()

    if not query:
        return Response({"error": "Query require"}, status=400)

    # filter rows where localit contains query
    filtered = df[df["final location"].str.lower().str.contains(query, na=False)
                  | df["city"].str.lower().str.lower().str.contains(query, na=False)
                  ]

    if filtered.empty:
        return Response({
            "summary": f"no data found '{query}'.",
            "chart_data": [],
            "table_data": []
        })

    # grp by year
    chart_data = (
        filtered.groupby("year")["flat - weighted average rate"]
        .mean()
        .reset_index()
        .to_dict(orient="records")

    )

    # sumarey
    summary = (f"[query.title()] has {len(filtered)} matching recor here is analysis. "
               f"Here is your analaysis"
               )

    return Response({
        "summary": summary,
        "chart_data": chart_data,
        "table_data": filtered.to_dict(orient="records")
    })
