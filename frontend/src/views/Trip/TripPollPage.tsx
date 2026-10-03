import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Form, Modal, ProgressBar, Stack } from "react-bootstrap";
import { useUser } from "../../contexts/UserContext";
import {
  createPoll as apiCreatePoll,
  deletePoll as apiDeletePoll,
  fetchPolls as apiFetchPolls,
  voteOnPoll as apiVoteOnPoll,
} from "../../api/poll";

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

export function TripPollPage() {
  const [showAddPollModal, setShowAddPollModal] = useState(false);
  const [addPollError, setAddPollError] = useState<string | null>(null);

  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useUser();

  const [newPollTitle, setNewPollTitle] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);

  useEffect(() => {
    const loadPolls = async () => {
      if (!tripId || !user) return;
      try {
        setIsLoading(true);
        const data = await apiFetchPolls(tripId);
        setPolls(data);
      } catch (error) {
        console.error("Error fetching polls:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPolls();
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

  const handleCreatePoll = async () => {
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

    try {
      if (!tripId) throw new Error("Trip ID is missing");
      const createdPoll = await apiCreatePoll(tripId, {
        title: newPollTitle,
        options: validOptions,
      });
      setPolls((prev) => [createdPoll, ...prev]);
      setNewPollTitle("");
      setNewOptions(["", ""]);
      setAddPollError(null);
      setShowAddPollModal(false);
    } catch (error) {
      setAddPollError(
        error instanceof Error ? error.message : "An error occurred.",
      );
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user || !tripId) return;
    try {
      const updatedPoll = await apiVoteOnPoll(tripId, pollId, optionId);
      setPolls((prev) => prev.map((p) => (p.id === pollId ? updatedPoll : p)));
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!user || !tripId) return;
    try {
      await apiDeletePoll(tripId, pollId);
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
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
            <Button variant="primary" onClick={handleCreatePoll}>
              Create Poll
            </Button>
          </Modal.Footer>
        </Modal>

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
                          onClick={() => handleDeletePoll(poll.id)}
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
                              onClick={() => handleVote(poll.id, option.id)}
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
