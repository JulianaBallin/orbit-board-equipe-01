import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "./client";

function mockResponse({
  ok = true,
  status = 200,
  contentType = "application/json",
  body = {},
} = {}) {
  return {
    ok,
    status,
    headers: {
      get: vi.fn(() => contentType),
    },
    json: vi.fn(() => Promise.resolve(body)),
    text: vi.fn(() => Promise.resolve(body)),
  };
}

function mockFetch(responseOptions = {}) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(mockResponse(responseOptions));
}

describe("api client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("response handling", () => {
    it("returns the parsed JSON response", async () => {
      const body = { id: "project-1", name: "Orbit Board" };

      mockFetch({ body });

      const result = await api.projects.get("project-1");

      expect(result).toEqual(body);
    });

    it("returns a text response when content type is not JSON", async () => {
      mockFetch({
        contentType: "text/plain",
        body: "Operation completed.",
      });

      const result = await api.dashboard();

      expect(result).toBe("Operation completed.");
    });

    it("returns null for a 204 response", async () => {
      const fetchSpy = mockFetch({
        status: 204,
        body: undefined,
      });

      const result = await api.projects.remove("project-1");

      expect(result).toBeNull();

      const response = await fetchSpy.mock.results[0].value;

      expect(response.json).not.toHaveBeenCalled();
      expect(response.text).not.toHaveBeenCalled();
    });

    it("uses the API detail as the error message", async () => {
      mockFetch({
        ok: false,
        status: 404,
        body: { detail: "Project not found." },
      });

      await expect(api.projects.get("missing-project")).rejects.toMatchObject({
        message: "Project not found.",
        status: 404,
        payload: { detail: "Project not found." },
      });
    });

    it("uses the API title when detail is unavailable", async () => {
      mockFetch({
        ok: false,
        status: 409,
        body: { title: "Project cannot be removed." },
      });

      await expect(api.projects.remove("project-1")).rejects.toThrow(
        "Project cannot be removed.",
      );
    });

    it("uses a text body as the error message", async () => {
      mockFetch({
        ok: false,
        status: 500,
        contentType: "text/plain",
        body: "Internal server error.",
      });

      await expect(api.dashboard()).rejects.toThrow("Internal server error.");
    });

    it("uses the default error message when the response body is empty", async () => {
      mockFetch({
        ok: false,
        status: 500,
        body: null,
      });

      await expect(api.dashboard()).rejects.toThrow(
        "Não foi possível concluir a operação.",
      );
    });

    it("merges custom headers with the default content type", async () => {
      mockFetch();

      await api.projects.create({ name: "Orbit Board" });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );
    });
  });

  describe("dashboard", () => {
    it("requests the dashboard endpoint", async () => {
      mockFetch();

      await api.dashboard();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:5200/api/dashboard",
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );
    });
  });

  describe("projects", () => {
    it.each([
      ["list", [], "/api/projects", undefined],
      ["get", ["project-1"], "/api/projects/project-1", undefined],
      [
        "create",
        [{ name: "Orbit Board" }],
        "/api/projects",
        {
          method: "POST",
          body: JSON.stringify({ name: "Orbit Board" }),
        },
      ],
      [
        "update",
        ["project-1", { name: "Updated project" }],
        "/api/projects/project-1",
        {
          method: "PUT",
          body: JSON.stringify({ name: "Updated project" }),
        },
      ],
      [
        "remove",
        ["project-1"],
        "/api/projects/project-1",
        {
          method: "DELETE",
        },
      ],
    ])(
      "calls the correct endpoint for projects.%s",
      async (method, args, path, expectedOptions) => {
        mockFetch();

        await api.projects[method](...args);

        expect(globalThis.fetch).toHaveBeenCalledWith(
          `http://localhost:5200${path}`,
          expect.objectContaining({
            ...expectedOptions,
            headers: {
              "Content-Type": "application/json",
            },
          }),
        );
      },
    );
  });

  describe("tasks", () => {
    it("lists tasks without a query string when filters are empty", async () => {
      mockFetch();

      await api.tasks.list();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:5200/api/tasks",
        expect.any(Object),
      );
    });

    it("adds valid task filters to the query string", async () => {
      mockFetch();

      await api.tasks.list({
        status: "Backlog",
        projectId: "project-1",
        search: "login flow",
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:5200/api/tasks?status=Backlog&projectId=project-1&search=login+flow",
        expect.any(Object),
      );
    });

    it("ignores undefined, null and empty task filters", async () => {
      mockFetch();

      await api.tasks.list({
        status: "Done",
        projectId: undefined,
        assigneeId: null,
        search: "",
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:5200/api/tasks?status=Done",
        expect.any(Object),
      );
    });

    it.each([
      ["get", ["task-1"], "/api/tasks/task-1", undefined],
      [
        "create",
        [{ title: "Create tests" }],
        "/api/tasks",
        {
          method: "POST",
          body: JSON.stringify({ title: "Create tests" }),
        },
      ],
      [
        "update",
        ["task-1", { title: "Update tests" }],
        "/api/tasks/task-1",
        {
          method: "PUT",
          body: JSON.stringify({ title: "Update tests" }),
        },
      ],
      [
        "changeStatus",
        ["task-1", "Done"],
        "/api/tasks/task-1/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "Done" }),
        },
      ],
      [
        "move",
        ["task-1", "Review", 2],
        "/api/tasks/task-1/position",
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "Review",
            position: 2,
          }),
        },
      ],
      [
        "remove",
        ["task-1"],
        "/api/tasks/task-1",
        {
          method: "DELETE",
        },
      ],
      ["history", ["task-1"], "/api/tasks/task-1/history", undefined],
    ])(
      "calls the correct endpoint for tasks.%s",
      async (method, args, path, expectedOptions) => {
        mockFetch();

        await api.tasks[method](...args);

        expect(globalThis.fetch).toHaveBeenCalledWith(
          `http://localhost:5200${path}`,
          expect.objectContaining({
            ...expectedOptions,
            headers: {
              "Content-Type": "application/json",
            },
          }),
        );
      },
    );
  });

  describe("team", () => {
    it.each([
      ["list", [], "/api/team-members", undefined],
      [
        "create",
        [{ name: "Diego Lima" }],
        "/api/team-members",
        {
          method: "POST",
          body: JSON.stringify({ name: "Diego Lima" }),
        },
      ],
      [
        "update",
        ["member-1", { name: "Updated member" }],
        "/api/team-members/member-1",
        {
          method: "PUT",
          body: JSON.stringify({ name: "Updated member" }),
        },
      ],
      [
        "remove",
        ["member-1"],
        "/api/team-members/member-1",
        {
          method: "DELETE",
        },
      ],
    ])(
      "calls the correct endpoint for team.%s",
      async (method, args, path, expectedOptions) => {
        mockFetch();

        await api.team[method](...args);

        expect(globalThis.fetch).toHaveBeenCalledWith(
          `http://localhost:5200${path}`,
          expect.objectContaining({
            ...expectedOptions,
            headers: {
              "Content-Type": "application/json",
            },
          }),
        );
      },
    );
  });
});
