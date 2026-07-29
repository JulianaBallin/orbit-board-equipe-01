import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import TasksPage from "./TasksPage";
import { api } from "../api/client";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const projects = [
  {
    id: "proj-1",
    name: "Agenda de Eventos",
  },
];

const tasks = [
  {
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
  },
  {
    id: "task-2",
    title: "Revisar documentação",
    description: "Validar documentação técnica.",
    projectId: "proj-1",
    projectName: "Agenda de Eventos",
    assigneeName: null,
    priority: "Medium",
    status: "Done",
    position: 0,
    dueDate: "2026-08-15",
    estimatedHours: 4,
  },
];

function renderPage() {
  return render(
    <MemoryRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <TasksPage />
    </MemoryRouter>,
  );
}

async function findTaskCard(title) {
  const taskTitle = await screen.findByRole("heading", {
    name: title,
  });

  const taskCard = taskTitle.closest(".task-card");

  if (!taskCard) {
    throw new Error(`Task card "${title}" was not found.`);
  }

  return taskCard;
}

describe("TasksPage", () => {
  const navigate = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(navigate);

    vi.spyOn(api.projects, "list").mockResolvedValue(projects);
    vi.spyOn(api.tasks, "list").mockResolvedValue(tasks);
    vi.spyOn(api.tasks, "history").mockResolvedValue([]);
    vi.spyOn(api.tasks, "changeStatus").mockResolvedValue(null);
    vi.spyOn(api.tasks, "remove").mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    navigate.mockReset();
  });

  it("opens the history modal for a task card", async () => {
    const user = userEvent.setup();

    renderPage();

    const taskCard = await findTaskCard("Validar fluxo de inscrição");

    await user.click(
      within(taskCard).getByRole("button", {
        name: "Histórico",
      }),
    );

    const dialog = await screen.findByRole("dialog");

    expect(
      within(dialog).getByText(/Validar fluxo de inscrição/),
    ).toBeInTheDocument();

    expect(api.tasks.history).toHaveBeenCalledWith("task-1");
  });

  it("navigates to the task creation page", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: "Nova tarefa",
      }),
    );

    expect(navigate).toHaveBeenCalledWith("/tasks/new");
  });

  it("navigates to the task edit page", async () => {
    const user = userEvent.setup();

    renderPage();

    const taskCard = await findTaskCard("Validar fluxo de inscrição");

    await user.click(
      within(taskCard).getByRole("button", {
        name: "Editar",
      }),
    );

    expect(navigate).toHaveBeenCalledWith("/tasks/task-1/edit");
  });

  it("changes the task status and reloads the tasks", async () => {
    const user = userEvent.setup();

    renderPage();

    const taskCard = await findTaskCard("Validar fluxo de inscrição");

    const statusSelect = within(taskCard).getByRole("combobox", {
      name: "Mover para",
    });

    await user.selectOptions(statusSelect, "Done");

    await waitFor(() => {
      expect(api.tasks.changeStatus).toHaveBeenCalledWith("task-1", "Done");
    });

    await waitFor(() => {
      expect(api.tasks.list).toHaveBeenCalledTimes(2);
    });
  });

  it("shows an error when changing status fails", async () => {
    const user = userEvent.setup();

    vi.mocked(api.tasks.changeStatus).mockRejectedValueOnce(
      new Error("Não foi possível alterar o status."),
    );

    renderPage();

    const taskCard = await findTaskCard("Validar fluxo de inscrição");

    const statusSelect = within(taskCard).getByRole("combobox", {
      name: "Mover para",
    });

    await user.selectOptions(statusSelect, "Review");

    expect(
      await screen.findByText("Não foi possível alterar o status."),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(api.tasks.list).toHaveBeenCalledTimes(2);
    });
  });

  it("updates filters and reloads tasks", async () => {
    const user = userEvent.setup();

    renderPage();

    const searchInput = await screen.findByPlaceholderText(
      "Buscar por título ou descrição",
    );

    await user.type(searchInput, "inscrição");

    await waitFor(() => {
      expect(api.tasks.list).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: "inscrição",
        }),
      );
    });
  });

  it("clears all filters", async () => {
    const user = userEvent.setup();

    renderPage();

    const searchInput = await screen.findByPlaceholderText(
      "Buscar por título ou descrição",
    );

    await user.type(searchInput, "documentação");

    await user.click(
      screen.getByRole("button", {
        name: "Limpar filtros",
      }),
    );

    expect(searchInput).toHaveValue("");

    await waitFor(() => {
      expect(api.tasks.list).toHaveBeenLastCalledWith({
        projectId: "",
        status: "",
        priority: "",
        assigneeId: "",
        search: "",
      });
    });
  });

  it("switches from board view to table view", async () => {
    const user = userEvent.setup();

    renderPage();

    const tableButton = await screen.findByRole("button", {
      name: "Tabela",
    });

    await user.click(tableButton);

    expect(tableButton).toHaveAttribute("aria-pressed", "true");

    expect(
      screen.getByRole("button", {
        name: "Quadro",
      }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("returns to the board view", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: "Tabela",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Quadro",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Quadro",
      }),
    ).toHaveAttribute("aria-pressed", "true");

    expect(
      screen.getByRole("region", {
        name: "Coluna Backlog",
      }),
    ).toBeInTheDocument();
  });

  it("opens and cancels the task deletion dialog", async () => {
    const user = userEvent.setup();

    renderPage();

    const taskCard = await findTaskCard("Validar fluxo de inscrição");

    await user.click(
      within(taskCard).getByRole("button", {
        name: "Excluir",
      }),
    );

    const cancelButton = await screen.findByRole("button", {
      name: "Cancelar",
    });

    expect(cancelButton).toBeInTheDocument();

    await user.click(cancelButton);

    expect(
      screen.queryByRole("button", {
        name: "Cancelar",
      }),
    ).not.toBeInTheDocument();

    expect(api.tasks.remove).not.toHaveBeenCalled();
  });

  it("deletes a task and displays a success notice", async () => {
    const user = userEvent.setup();

    renderPage();

    const taskCard = await findTaskCard("Validar fluxo de inscrição");

    await user.click(
      within(taskCard).getByRole("button", {
        name: "Excluir",
      }),
    );

    const confirmButton = await screen.findByRole("button", {
      name: "Excluir tarefa",
    });

    await user.click(confirmButton);

    await waitFor(() => {
      expect(api.tasks.remove).toHaveBeenCalledWith("task-1");
    });

    expect(await screen.findByText("Tarefa excluída.")).toBeInTheDocument();

    await waitFor(() => {
      expect(api.tasks.list).toHaveBeenCalledTimes(2);
    });
  });

  it("shows an error when task deletion fails", async () => {
    const user = userEvent.setup();

    vi.mocked(api.tasks.remove).mockRejectedValueOnce(
      new Error("Não foi possível excluir a tarefa."),
    );

    renderPage();

    const taskCard = await findTaskCard("Validar fluxo de inscrição");

    await user.click(
      within(taskCard).getByRole("button", {
        name: "Excluir",
      }),
    );

    const confirmButton = await screen.findByRole("button", {
      name: "Excluir tarefa",
    });

    await user.click(confirmButton);

    expect(
      await screen.findByText("Não foi possível excluir a tarefa."),
    ).toBeInTheDocument();

    expect(api.tasks.remove).toHaveBeenCalledWith("task-1");
  });

  it("shows an error when loading tasks fails", async () => {
    vi.mocked(api.tasks.list).mockRejectedValueOnce(
      new Error("Não foi possível carregar as tarefas."),
    );

    renderPage();

    expect(
      await screen.findByText("Não foi possível carregar as tarefas."),
    ).toBeInTheDocument();
  });

  it("shows an error when loading projects fails", async () => {
    vi.mocked(api.projects.list).mockRejectedValueOnce(
      new Error("Não foi possível carregar os projetos."),
    );

    renderPage();

    expect(
      await screen.findByText("Não foi possível carregar os projetos."),
    ).toBeInTheDocument();
  });

  it("formats due dates and displays fallback values", async () => {
    renderPage();

    const backlogTaskCard = await findTaskCard("Validar fluxo de inscrição");

    const doneTaskCard = await findTaskCard("Revisar documentação");

    expect(within(doneTaskCard).getByText("15/08/2026")).toBeInTheDocument();

    expect(within(backlogTaskCard).getByText("Sem prazo")).toBeInTheDocument();

    expect(
      within(doneTaskCard).getByText("Sem responsável"),
    ).toBeInTheDocument();
  });
});
