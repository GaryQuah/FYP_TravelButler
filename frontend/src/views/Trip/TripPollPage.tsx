import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  Container,
  Form,
  Modal,
  ProgressBar,
  Stack,
} from "react-bootstrap";
import { useUser } from "../../models/UserContext";

interface Vote {
  userId: string;
  userName: string;
}

interface PollOption {
  id: string;
  text: string;
  votes: Vote[];
}

interface Poll {
  id: string;
  title: string;
  createdBy?: string;
  createdAt: string;
  options: PollOption[];
}

const mockPolls: Poll[] = [];

export function TripPollPage() {
  // Existing Modal Control
  const [showModal, setShowModal] = useState(false);
  const [showAddPollModal, setShowAddPollModal] = useState(false);
  const [addPollError, setAddPollError] = useState<string | null>(null);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [editPollError, setEditPollError] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedOptions, setEditedOptions] = useState<string[]>([]);

  // Poll State
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useUser();

  const [newPollTitle, setNewPollTitle] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);

  useEffect(() => {
    const fetchPolls = async () => {
      if (!tripId || !user) return;
      try {
        setIsLoading(true);
        const token = localStorage.getItem("access_token");
        const response = await fetch(`/api/trip/${tripId}/polls`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPolls(data);
        } else {
          console.error("Failed to fetch polls");
        }
      } catch (error) {
        console.error("Error fetching polls:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolls();
  }, [tripId, user]);

  const sortedPolls = useMemo(() => {
    return [...polls].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [polls]);

  const addOptionField = () => {
    setNewOptions((prev) => [...prev, ""]);
  };

  const updateOptionField = (index: number, value: string) => {
    const updated = [...newOptions];
    updated[index] = value;
    setNewOptions(updated);
  };

  const createPoll = async () => {
    if (!user) {
      setAddPollError("You must be logged in to create a poll.");
      return;
    }
    if (!newPollTitle.trim()) {
      setAddPollError("Poll title is required.");
      return;
    }

    const validOptions = newOptions.filter((o) => o.trim() !== "");

    if (validOptions.length < 2) {
      setAddPollError("Minimum 2 options required.");
      return;
    }

    const newPoll = {
      title: newPollTitle,
      options: validOptions,
    };

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/trip/${tripId}/polls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPoll),
      });

      if (response.ok) {
        const createdPoll = await response.json();
        setPolls((prev) => [createdPoll, ...prev]);
        setNewPollTitle("");
        setNewOptions(["", ""]);
        setAddPollError(null);
        setShowAddPollModal(false);
      } else {
        setAddPollError("Failed to create poll. Please try again.");
      }
    } catch (error) {
      setAddPollError("An error occurred. Please try again.");
    }
  };

  const vote = async (pollId: string, optionId: string) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `/api/trip/${tripId}/polls/${pollId}/options/${optionId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const updatedPoll = await response.json();
        setPolls((prev) =>
          prev.map((p) => (p.id === pollId ? updatedPoll : p)),
        );
      } else {
        console.error("Failed to vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const deletePoll = async (pollId: string) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/trip/${tripId}/polls/${pollId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPolls((prev) => prev.filter((p) => p.id !== pollId));
      } else {
        console.error("Failed to delete poll");
      }
    } catch (error) {
      console.error("Error deleting poll:", error);
    }
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Trip Polls</h2>
          <Button variant="primary" onClick={() => setShowAddPollModal(true)}>
            Create Poll
          </Button>
        </div>

        {/* Create Poll Modal */}
        <Modal
          show={showAddPollModal}
          onHide={() => setShowAddPollModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Create Poll</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Poll Question</Form.Label>
              <Form.Control
                value={newPollTitle}
                onChange={(e) => setNewPollTitle(e.target.value)}
                placeholder="Enter poll question"
              />
            </Form.Group>
            <Form.Label>Options</Form.Label>
            {newOptions.map((option, index) => (
              <Form.Control
                key={index}
                className="mb-2"
                value={option}
                placeholder={`Option ${index + 1}`}
                onChange={(e) => updateOptionField(index, e.target.value)}
              />
            ))}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={addOptionField}
            >
              Add Option
            </Button>
            {addPollError && (
              <div className="text-danger mt-3">{addPollError}</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowAddPollModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={createPoll}>
              Create Poll
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Poll Cards */}
        {isLoading ? (
          <div>Loading...</div>
        ) : sortedPolls.length > 0 ? (
          <Stack gap={3}>
            {sortedPolls.map((poll) => {
              const totalVotes = poll.options.reduce(
                (sum, option) => sum + option.votes.length,
                0,
              );
              return (
                <Card key={poll.id}>
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div>
                        <Card.Title>{poll.title}</Card.Title>
                        <Card.Subtitle className="text-muted">
                          {new Date(poll.createdAt).toLocaleString()}
                        </Card.Subtitle>
                      </div>
                      <div className="d-flex align-items-center">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deletePoll(poll.id)}
                          className="me-2"
                        >
                          Delete
                        </Button>
                        <div className="text-end">
                          <strong>{totalVotes}</strong>
                          <div>Total Votes</div>
                        </div>
                      </div>
                    </div>
                    <hr />
                    {poll.options.map((option) => {
                      const percentage =
                        totalVotes === 0
                          ? 0
                          : Number(
                              (
                                (option.votes.length / totalVotes) *
                                100
                              ).toFixed(1),
                            );
                      return (
                        <Card
                          key={option.id}
                          className="mb-3 border-0 bg-light"
                        >
                          <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                              <strong>{option.text}</strong>
                              <span>
                                {percentage}% ({option.votes.length})
                              </span>
                            </div>
                            <ProgressBar now={percentage} className="mb-3" />
                            <div className="small text-muted mb-2">
                              <strong>Voters:</strong>{" "}
                              {option.votes.length > 0
                                ? option.votes.map((v) => v.userName).join(", ")
                                : "No votes yet"}
                            </div>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => vote(poll.id, option.id)}
                            >
                              Vote
                            </Button>
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </Card.Body>
                </Card>
              );
            })}
          </Stack>
        ) : (
          <div className="text-center">
            <p>No polls available. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
