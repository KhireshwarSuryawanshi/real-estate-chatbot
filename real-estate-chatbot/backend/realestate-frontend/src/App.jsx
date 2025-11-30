import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);


function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function sendQuery() {
    if (!query.trim()) return alert("Please enter something");

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/analyze/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Error reaching backend");
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 20 }}>
      <h1>Real Estate Analyzer</h1>

      <textarea
        rows="2"
        placeholder="Ask something like 'wakad' or 'pune'"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      ></textarea>

      <button
        onClick={sendQuery}
        style={{
          marginTop: 10,
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {result && (
        <>
          <h2>Summary</h2>
          <p>{result.summary}</p>

          <h2>Price Trend (Yearly)</h2>
          <div style={{ width: "600px", marginTop: "20px" }}>
            <Line
              data={{
                labels: result.chart_data.map((item) => item.year),
                datasets: [
                  {
                    label: "Flat Weighted Average Rate",
                    data: result.chart_data.map(
                      (item) => item["flat - weighted average rate"]
                    ),
                    borderColor: "#0074D9", // nice blue line
                    backgroundColor: "rgba(0, 116, 217, 0.2)", // light blue fill
                    borderWidth: 3,
                    pointBackgroundColor: "#ffffff",
                    pointBorderColor: "#0074D9",
                    pointRadius: 5,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: "black", // label text black
                    },
                  },
                },
                scales: {
                  x: {
                    ticks: { color: "black" },
                    grid: { color: "rgba(0,0,0,0.1)" },
                  },
                  y: {
                    ticks: { color: "black" },
                    grid: { color: "rgba(0,0,0,0.1)" },
                  },
                },
              }}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "10px",
              }}
            />


          </div>

          <h2>Raw Table Data</h2>
          <table border="1" cellPadding="5" style={{ marginTop: "20px" }}>
            <thead>
              <tr>
                <th>Year</th>
                <th>City</th>
                <th>Final Location</th>
                <th>Weighted Average Rate</th>
              </tr>
            </thead>

            <tbody>
              {result.table_data.map((row, index) => (
                <tr key={index}>
                  <td>{row.year}</td>
                  <td>{row.city}</td>
                  <td>{row["final location"]}</td>
                  <td>{row["flat - weighted average rate"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

    </div>
  );
}

export default App;
