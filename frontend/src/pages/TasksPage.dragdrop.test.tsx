import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TasksPage from "./TasksPage";
import { api } from "../api/client";
import { statusLabel } from "../utils/labels";
import { makeProject, makeWorkItem } from "../test/fixtures";
import type { WorkItemStatus } from "../types/api";
import { renderWithTheme } from "../test/renderWithTheme";

const projects = [makeProject({ id: "proj-1", name: "Agenda de Eventos" })];

const backlogTask = makeWorkItem({
  id: "task-1",
  title: "Validar fluxo de inscrição",
  description: "Testar cenários de sucesso.",
  projectId: "proj-1",
  projectName: "Agenda de Eventos",
  assigneeName: "Diego Lima",
  priority: "Critical",
  status: "Backlog",
  position: 0,
  dueDate: null,
  estimatedHours: 12,
});

function renderPage() {
  return renderWithTheme(
    <MemoryRouter>
      <TasksPage />
    </MemoryRouter>,
  );
}

const column = (status: WorkItemStatus) =>
  screen.getByLabelText(`Coluna ${statusLabel(status)}`);

function pointAt(status: WorkItemStatus) {
  document.elementFromPoint = () => column(status);
}

function stackCards(cards: HTMLElement[]) {
  cards.forEach((card, index) => {
    card.getBoundingClientRect = () => new DOMRect(0, index * 100, 300, 100);
  });
}

async function dragCardTo(status: WorkItemStatus, { drop = true }: { drop?: boolean } = {}) {
  const card = await screen.findByTitle(
    "Arraste para mover a tarefa de estágio",
  );

  pointAt(status);

  fireEvent.pointerDown(card, {
    button: 0,
    clientX: 10,
    clientY: 10,
  });

  fireEvent.pointerMove(window, {
    clientX: 300,
    clientY: 300,
  });

  if (drop) {
    await act(async () => {
      fireEvent.pointerUp(window, {
        clientX: 300,
        clientY: 300,
      });
    });
  }

  return card;
}

describe("TasksPage pointer dragging", () => {
  beforeEach(() => {
    vi.spyOn(api.projects, "list").mockResolvedValue(projects);
    vi.spyOn(api.tasks, "list").mockResolvedValue([backlogTask]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.elementFromPoint = () => null;
    document.body.classList.remove("is-dragging-task");
  });

  it("moves the task to the column where the pointer was released", async () => {
    const move = vi.spyOn(api.tasks, "move").mockResolvedValue(makeWorkItem({ status: "Done" }));

    renderPage();
    await dragCardTo("Done");

    await waitFor(() => {
      expect(move).toHaveBeenCalledWith("task-1", "Done", 0);
      expect(vi.mocked(api.tasks.list).mock.calls.length).toBeGreaterThan(1);
    });
  });

  it("does not call the API when released over its own column", async () => {
    const move = vi.spyOn(api.tasks, "move").mockResolvedValue(backlogTask);

    renderPage();
    await dragCardTo("Backlog");

    await waitFor(() => expect(api.tasks.list).toHaveBeenCalled());
    expect(move).not.toHaveBeenCalled();
  });

  it("reorders inside the same column when dropped over a peer", async () => {
    const peer = {
      ...backlogTask,
      id: "task-2",
      title: "Segunda tarefa do backlog",
      position: 1,
    };
    vi.mocked(api.tasks.list).mockResolvedValue([backlogTask, peer]);
    const move = vi.spyOn(api.tasks, "move").mockResolvedValue(backlogTask);

    renderPage();
    const cards = await screen.findAllByTitle(
      "Arraste para mover a tarefa de estágio",
    );
    stackCards(cards);
    pointAt("Backlog");

    const peerCard = cards[1];
    if (!peerCard) throw new Error('Card par não encontrado.');
    fireEvent.pointerDown(peerCard, { button: 0, clientX: 10, clientY: 400 });
    fireEvent.pointerMove(window, { clientX: 10, clientY: 20 });
    fireEvent.pointerUp(window, { clientX: 10, clientY: 20 });

    await waitFor(() =>
      expect(move).toHaveBeenCalledWith("task-2", "Backlog", 0),
    );
  });

  it("shows a floating copy of the card while dragging", async () => {
    renderPage();
    await dragCardTo("Done", { drop: false });

    const layer = document.querySelector(".drag-layer");
    if (!layer) throw new Error('Camada de arraste não encontrada.');
    expect(layer.textContent).toContain("Validar fluxo de inscrição");
    expect(document.body).toHaveClass("is-dragging-task");

    fireEvent.pointerUp(window, { clientX: 300, clientY: 300 });
    await waitFor(() =>
      expect(document.querySelector(".drag-layer")).toBeNull(),
    );
    expect(document.body).not.toHaveClass("is-dragging-task");
  });

  it("marks where the card will land", async () => {
    renderPage();
    await dragCardTo("Done", { drop: false });

    expect(document.querySelector(".drop-placeholder")).not.toBeNull();
    expect(column("Done")).toHaveClass("drop-target");

    fireEvent.pointerUp(window, { clientX: 300, clientY: 300 });
  });

  it("ignores a press that starts on the controls inside the card", async () => {
    const move = vi.spyOn(api.tasks, "move").mockResolvedValue(backlogTask);

    renderPage();
    await screen.findByTitle("Arraste para mover a tarefa de estágio");
    pointAt("Done");
    const select = screen.getByDisplayValue(statusLabel("Backlog"));

    fireEvent.pointerDown(select, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { clientX: 300, clientY: 300 });
    fireEvent.pointerUp(window, { clientX: 300, clientY: 300 });

    expect(document.querySelector(".drag-layer")).toBeNull();
    expect(move).not.toHaveBeenCalled();
  });

  it("does not drag on a plain click without movement", async () => {
    const move = vi.spyOn(api.tasks, "move").mockResolvedValue(backlogTask);

    renderPage();
    const card = await screen.findByTitle(
      "Arraste para mover a tarefa de estágio",
    );
    pointAt("Done");

    fireEvent.pointerDown(card, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { clientX: 12, clientY: 11 });
    fireEvent.pointerUp(window, { clientX: 12, clientY: 11 });

    expect(document.querySelector(".drag-layer")).toBeNull();
    expect(move).not.toHaveBeenCalled();
  });

  it("reloads the board and reports the error when the move fails", async () => {
    vi.spyOn(api.tasks, "move").mockRejectedValue(
      new Error("Falha ao mover a tarefa."),
    );

    renderPage();
    await dragCardTo("Done");

    expect(
      await screen.findByText("Falha ao mover a tarefa."),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(vi.mocked(api.tasks.list).mock.calls.length).toBeGreaterThan(1);
    });
  });
});
