import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ProjectsPage from "./ProjectsPage";
import { api } from "../api/client";
import { makeProject } from "../test/fixtures";

const projectWithPending = makeProject({
  id: "proj-1",
  name: "Project With Pending Tasks",
  description: "Project that still has open tasks.",
  status: "Active",
  ownerName: "Diego Lima",
  dueDate: null,
  totalTasks: 4,
  completedTasks: 2,
});

const projectAllDone = makeProject({
  id: "proj-2",
  name: "Fully Concluded Project",
  description: "Project whose tasks are all done.",
  status: "Completed",
  ownerName: "Ana Souza",
  dueDate: null,
  totalTasks: 3,
  completedTasks: 3,
});

function renderPage() {
  return render(
    <MemoryRouter>
      <ProjectsPage />
    </MemoryRouter>,
  );
}

describe("ProjectsPage delete guard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("disables deletion while the project still has unfinished tasks", async () => {
    vi.spyOn(api.projects, "list").mockResolvedValue([projectWithPending]);
    const remove = vi.spyOn(api.projects, "remove").mockResolvedValue(undefined);

    renderPage();

    const button = await screen.findByRole("button", { name: "Excluir" });
    expect(button).toBeDisabled();
    expect(remove).not.toHaveBeenCalled();
  });

  it("allows deletion once every task is concluded", async () => {
    vi.spyOn(api.projects, "list").mockResolvedValue([projectAllDone]);
    const remove = vi.spyOn(api.projects, "remove").mockResolvedValue(undefined);

    renderPage();

    const button = await screen.findByRole("button", { name: "Excluir" });
    expect(button).toBeEnabled();

    await userEvent.click(button);
    await userEvent.click(
      await screen.findByRole("button", { name: "Excluir projeto" }),
    );

    expect(remove).toHaveBeenCalledWith("proj-2");
    expect(await screen.findByText("Projeto excluído.")).toBeInTheDocument();
  });

  it("warns that concluded tasks are removed together with the project", async () => {
    vi.spyOn(api.projects, "list").mockResolvedValue([projectAllDone]);
    vi.spyOn(api.projects, "remove").mockResolvedValue(undefined);

    renderPage();

    await userEvent.click(
      await screen.findByRole("button", { name: "Excluir" }),
    );

    expect(
      await screen.findByText(
        "As 3 tarefa(s) concluída(s) deste projeto também serão removidas.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the project when the confirmation is dismissed", async () => {
    vi.spyOn(api.projects, "list").mockResolvedValue([projectAllDone]);
    const remove = vi.spyOn(api.projects, "remove").mockResolvedValue(undefined);

    renderPage();

    await userEvent.click(
      await screen.findByRole("button", { name: "Excluir" }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Cancelar" }),
    );

    expect(remove).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
