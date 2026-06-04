import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Container,
  Form,
  Modal,
  ProgressBar,
  Stack,
} from "react-bootstrap";

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
  createdAt: string;
  options: PollOption[];
}

const mockPolls: Poll[] = [
  {
    id: "1",
    title: "Where should we go for dinner?",
    createdAt: "2026-06-04T10:00:00",
    options: [
      {
        id: "1",
        text: "Fish & Co",
        votes: [
          { userId: "1", userName: "Gary" },
          { userId: "2", userName: "John" },
        ],
      },
      {
        id: "2",
        text: "McDonalds",
        votes: [{ userId: "3", userName: "Sarah" }],
      },
      {
        id: "3",
        text: "KFC",
        votes: [],
      },
    ],
  },
  {
    id: "2",
    title: "Preferred Travel Destination",
    createdAt: "2026-06-03T14:00:00",
    options: [
      {
        id: "1",
        text: "Japan",
        votes: [
          { userId: "1", userName: "Gary" },
          { userId: "4", userName: "Mike" },
        ],
      },
      {
        id: "2",
        text: "Korea",
        votes: [{ userId: "2", userName: "John" }],
      },
    ],
  },
];

export function TripPollPage() {
  // Existing Modal Control
  const [showModal, setShowModal] = useState(false);
  const [showAddPollModal, setShowAddPollModal] = useState(false);
  const [addPollError, setAddPollError] = useState<string | null>(null);

  // Poll State
  const [polls, setPolls] = useState<Poll[]>(mockPolls);

  const [newPollTitle, setNewPollTitle] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);

  const currentUser = {
    id: "999",
    name: "Current User",
  };

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

  const createPoll = () => {
    if (!newPollTitle.trim()) {
      setAddPollError("Poll title is required.");
      return;
    }

    const validOptions = newOptions.filter((o) => o.trim() !== "");

    if (validOptions.length < 2) {
      setAddPollError("Minimum 2 options required.");
      return;
    }

    const poll: Poll = {
      id: crypto.randomUUID(),
      title: newPollTitle,
      createdAt: new Date().toISOString(),
      options: validOptions.map((option) => ({
        id: crypto.randomUUID(),
        text: option,
        votes: [],
      })),
    };

    setPolls((prev) => [poll, ...prev]);

    setNewPollTitle("");
    setNewOptions(["", ""]);
    setAddPollError(null);
    setShowAddPollModal(false);
  };

  const vote = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll;

        const hasVoted = poll.options.some((option) =>
          option.votes.some((vote) => vote.userId === currentUser.id),
        );

        if (hasVoted) return poll;

        return {
          ...poll,
          options: poll.options.map((option) =>
            option.id === optionId
              ? {
                  ...option,
                  votes: [
                    ...option.votes,
                    {
                      userId: currentUser.id,
                      userName: currentUser.name,
                    },
                  ],
                }
              : option,
          ),
        };
      }),
    );
  };

  return (
    <Container className="py-4">
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

                  <div className="text-end">
                    <strong>{totalVotes}</strong>
                    <div>Total Votes</div>
                  </div>
                </div>

                <hr />

                {poll.options.map((option) => {
                  const percentage =
                    totalVotes === 0
                      ? 0
                      : Number(
                          ((option.votes.length / totalVotes) * 100).toFixed(1),
                        );

                  return (
                    <Card key={option.id} className="mb-3 border-0 bg-light">
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
    </Container>
  );
}
