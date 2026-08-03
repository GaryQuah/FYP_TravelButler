import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getTripBudget } from "../../api/budget";
import { getAuthHeaders } from "../../api/auth";
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
  Modal,
} from "react-bootstrap";
import { analyzeReceipt } from "../../api/gemini";

import type {
  TripBudget,
  ExpenseItem,
  Category,
  Contributor,
} from "../../models/budget";

import { BAR_COLORS } from "../../models/budget";

export function TripBudgetPage() {
  const [trip, setTrip] = useState<TripBudget | null>(null);
  const { tripId } = useParams<{ tripId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [editableReceipt, setEditableReceipt] = useState<any>(null);

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
    console.log("--- Budget Calculation ---");
    console.log("Total Expenditure:", totalTravelExpenditure);
    console.log("Trip data:", trip);

    if (!trip) {
      console.log("Result: 0 (no trip data)");
      return 0;
    }

    const contributorCount = trip.contributors.length;
    console.log("Number of contributors:", contributorCount);

    if (contributorCount === 0) {
      console.log("Result: 0 (no contributors)");
      return 0;
    }

    const result = totalTravelExpenditure / contributorCount;
    console.log("Final Result (per person):", result);
    console.log("--------------------------");

    return result;
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
        headers: getAuthHeaders(),
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

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const data = await analyzeReceipt(file);
        setReceiptData(data);
        setEditableReceipt(data.expenditure);
        setShowModal(true);
      } catch (error) {
        console.error("Error analyzing receipt:", error);
      }
    }
  };

  const handleSaveExpense = () => {
    if (!trip || !editableReceipt) return;

    const { item, amount, category } = editableReceipt;

    let updatedTrip = { ...trip };
    let categoryId = updatedTrip.categories.find(
      (c) => c.name === category,
    )?.id;

    if (!categoryId) {
      const newCategory: Category = {
        id: crypto.randomUUID(),
        name: category,
        expenses: [],
      };
      updatedTrip = {
        ...updatedTrip,
        categories: [...updatedTrip.categories, newCategory],
      };
      categoryId = newCategory.id;
    }

    const expense: ExpenseItem = {
      id: crypto.randomUUID(),
      title: item,
      amount: Number(amount),
    };

    updatedTrip = {
      ...updatedTrip,
      categories: updatedTrip.categories.map((c) =>
        c.id === categoryId ? { ...c, expenses: [...c.expenses, expense] } : c,
      ),
    };

    updateTripBudget(updatedTrip);

    setShowModal(false);
    setReceiptData(null);
    setEditableReceipt(null);
  };

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableReceipt((prev: any) => ({
      ...prev,
      [name]: value,
    }));
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
          EXPENDITURE PER PERSON 
      ===================================================== */}

      <Card className="mb-4">
        <Card.Body>
          <h4 className="mb-3">Expenditure Per Person</h4>

          <Table bordered responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Paid Amount</th>
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
          <h4 className="mb-3">Add New Category or Upload Receipt</h4>
          <Row>
            <Col>
              <Form.Control
                placeholder="Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </Col>
            <Col md="auto">
              <Button onClick={addCategory}>
                <i className="bi bi-plus-circle me-2"></i>Add Category
              </Button>
            </Col>
            <Col md="auto">
              <Button
                variant="success"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="bi bi-upload me-2"></i>Upload Receipt
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept="image/*"
              />
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
                      <i className="bi bi-plus me-2"></i>Add Expense
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

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editableReceipt && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Item</Form.Label>
                <Form.Control
                  type="text"
                  name="item"
                  value={editableReceipt.item}
                  onChange={handleModalInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={editableReceipt.amount}
                  onChange={handleModalInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  name="category"
                  value={editableReceipt.category}
                  onChange={handleModalInputChange}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveExpense}>
            Save Expense
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
