import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getTripBudget } from "../../api/budget";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Tabs,
  Tab,
  Table,
} from "react-bootstrap";

/* =========================================================
   Models
========================================================= */

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
}

export interface Category {
  id: string;
  name: string;
  expenses: ExpenseItem[];
}

export interface Contributor {
  id: string;
  name: string;
  paidAmount: number;
}

export interface TripBudget {
  id: string;
  tripName: string;
  peopleCount: number;
  categories: Category[];
  contributors: Contributor[];
}

/* =========================================================
   Mock Data
========================================================= */

/* =========================================================
   Colors
========================================================= */

const BAR_COLORS = [
  "#0d6efd",
  "#198754",
  "#dc3545",
  "#fd7e14",
  "#6f42c1",
  "#20c997",
];

/* =========================================================
   Component
========================================================= */

export function TripBudgetPage() {
  const [trip, setTrip] = useState<TripBudget | null>(null);
  const { tripId } = useParams<{ tripId: string }>();

  useEffect(() => {
    const fetchTripBudget = async () => {
      if (!tripId) return;
      try {
        const data = await getTripBudget(tripId);
        setTrip(data);
      } catch (error) {
        console.error("Error fetching trip budget:", error);
      }
    };

    fetchTripBudget();
  }, [tripId]);

  const [expenseInputs, setExpenseInputs] = useState<{
    [categoryId: string]: { title: string; amount: string };
  }>({});
  const [newCategoryName, setNewCategoryName] = useState("");

  /* =========================================================
     Totals
  ========================================================= */

  const totalTravelExpenditure = useMemo(() => {
    if (!trip) return 0;
    return trip.categories.reduce(
      (sum, c) => sum + c.expenses.reduce((s, e) => s + e.amount, 0),
      0,
    );
  }, [trip]);

  const amountPerPerson = useMemo(() => {
    if (!trip || !trip.peopleCount) return 0;
    return totalTravelExpenditure / trip.peopleCount;
  }, [trip, totalTravelExpenditure]);

  const perPersonSummary = useMemo(() => {
    if (!trip) return [];
    return trip.contributors.map((c) => ({
      ...c,
      owed: amountPerPerson - c.paidAmount,
    }));
  }, [trip, amountPerPerson]);

  const chartData = useMemo(() => {
    if (!trip) return [];
    return trip.categories.map((c) => ({
      name: c.name,
      total: c.expenses.reduce((s, e) => s + e.amount, 0),
    }));
  }, [trip]);

  /* =========================================================
     Actions
  ========================================================= */

  const updateTripBudget = async (updatedTrip: TripBudget) => {
    if (!trip) return;
    try {
      const response = await fetch(`/api/budget/${trip.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTrip),
      });

      if (response.ok) {
        const data = await response.json();
        setTrip(data);
      } else {
        console.error("Failed to update trip budget");
      }
    } catch (error) {
      console.error("Error updating trip budget:", error);
    }
  };

  const updatePaidAmount = (id: string, value: number) => {
    if (!trip) return;
    const updatedTrip = {
      ...trip,
      contributors: trip.contributors.map((c) =>
        c.id === id ? { ...c, paidAmount: value } : c,
      ),
    };
    updateTripBudget(updatedTrip);
  };

  const addExpense = (categoryId: string) => {
    if (!trip) return;
    const input = expenseInputs[categoryId];
    if (!input?.title || !input?.amount) return;

    const expense: ExpenseItem = {
      id: crypto.randomUUID(),
      title: input.title,
      amount: Number(input.amount),
    };

    const updatedTrip = {
      ...trip,
      categories: trip.categories.map((c) =>
        c.id === categoryId ? { ...c, expenses: [...c.expenses, expense] } : c,
      ),
    };
    updateTripBudget(updatedTrip);

    setExpenseInputs((p) => ({
      ...p,
      [categoryId]: { title: "", amount: "" },
    }));
  };

  const addCategory = () => {
    if (!trip || !newCategoryName) return;

    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: newCategoryName,
      expenses: [],
    };

    const updatedTrip = {
      ...trip,
      categories: [...trip.categories, newCategory],
    };

    updateTripBudget(updatedTrip);
    setNewCategoryName(""); // Reset input field
  };

  /* =========================================================
     UI
  ========================================================= */

  if (!trip) {
    return <div>Loading...</div>;
  }

  return (
    <Container fluid className="py-4">
      <h2 className="mb-3">{trip.tripName} Budget Tracker</h2>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h5>Total Travel Expenditure</h5>
              <h3>${totalTravelExpenditure.toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body>
              <h5>Per Person</h5>
              <h3>${amountPerPerson.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* =====================================================
          BAR CHART (NOW ABOVE PERSON SECTION)
      ===================================================== */}

      <Card className="mb-4">
        <Card.Body style={{ height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              <Bar dataKey="total">
                {chartData.map((entry, i) => (
                  <Cell
                    key={`cell-${entry.name}-${i}`}
                    fill={BAR_COLORS[i % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      {/* =====================================================
          EXPENDITURE PER PERSON (EDITABLE)
      ===================================================== */}

      <Card className="mb-4">
        <Card.Body>
          <h4 className="mb-3">Expenditure Per Person</h4>

          <Table bordered responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Paid Amount (Editable)</th>
                <th>Expected</th>
                <th>Balance</th>
              </tr>
            </thead>

            <tbody>
              {perPersonSummary.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>

                  <td style={{ width: 200 }}>
                    <Form.Control
                      type="number"
                      value={p.paidAmount}
                      onChange={(e) =>
                        updatePaidAmount(p.id, Number(e.target.value))
                      }
                    />
                  </td>

                  <td>${amountPerPerson.toFixed(2)}</td>

                  <td>
                    {p.owed > 0 ? (
                      <span className="text-danger fw-bold">
                        Owes ${p.owed.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-success fw-bold">
                        Gets back ${Math.abs(p.owed).toFixed(2)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* =====================================================
          ADD NEW CATEGORY
      ===================================================== */}

      <Card className="mb-4">
        <Card.Body>
          <h4 className="mb-3">Add New Category</h4>
          <Row>
            <Col>
              <Form.Control
                placeholder="Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </Col>
            <Col md="auto">
              <Button onClick={addCategory}>Add Category</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* =====================================================
          CATEGORY BREAKDOWN
      ===================================================== */}

      <Tabs>
        {trip.categories.map((category) => (
          <Tab key={category.id} eventKey={category.id} title={category.name}>
            <Card className="mt-3">
              <Card.Body>
                <Row className="mb-3">
                  <Col>
                    <Form.Control
                      placeholder="Expense title"
                      value={expenseInputs[category.id]?.title || ""}
                      onChange={(e) =>
                        setExpenseInputs((p) => ({
                          ...p,
                          [category.id]: {
                            ...p[category.id],
                            title: e.target.value,
                          },
                        }))
                      }
                    />
                  </Col>

                  <Col>
                    <Form.Control
                      type="number"
                      placeholder="Amount"
                      value={expenseInputs[category.id]?.amount || ""}
                      onChange={(e) =>
                        setExpenseInputs((p) => ({
                          ...p,
                          [category.id]: {
                            ...p[category.id],
                            amount: e.target.value,
                          },
                        }))
                      }
                    />
                  </Col>

                  <Col md="auto">
                    <Button onClick={() => addExpense(category.id)}>
                      Add Expense
                    </Button>
                  </Col>
                </Row>

                <Table bordered hover>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {category.expenses.map((e) => (
                      <tr key={e.id}>
                        <td>{e.title}</td>
                        <td>${e.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>
        ))}
      </Tabs>
    </Container>
  );
}
