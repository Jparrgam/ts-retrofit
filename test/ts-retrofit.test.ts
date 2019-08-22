import * as http from "http";
import { app } from "./server";
import { ServiceBuilder } from "../src";
import {
  TEST_SERVER_ENDPOINT, API_PREFIX, TOKEN, UserService, SearchService,
  AuthService, User, SearchQuery, Auth, TEST_SERVER_PORT
} from "./fixtures";

describe("Test ts-retrofit.", () => {

  let server: http.Server;

  beforeAll(() => {
    server = app.listen(TEST_SERVER_PORT);
  });

  afterAll(() => {
    server.close();
  });

  test("Test `@BasePath` decorator.", async () => {
    const userService = new ServiceBuilder()
      .setEndpoint(TEST_SERVER_ENDPOINT)
      .build(UserService);
    const response = await userService.getUsers(TOKEN);
    expect(response.config.url).toEqual(`${TEST_SERVER_ENDPOINT}${API_PREFIX}/users`);
  });

  test("Test `@GET` decorator.", async () => {
    const userService = new ServiceBuilder()
      .setEndpoint(TEST_SERVER_ENDPOINT)
      .build(UserService);

    const response = await userService.getUsers(TOKEN);
    expect(response.config.method).toEqual("get");
    expect(response.config.url).toEqual(`${TEST_SERVER_ENDPOINT}${API_PREFIX}/users`);
  });

  test("Test `@POST` decorator.", async () => {
    const userService = new ServiceBuilder()
      .setEndpoint(TEST_SERVER_ENDPOINT)
      .build(UserService);
    const newUser: User = {
      name: "Jane",
      age: 18
    };
    const response = await userService.createUser(TOKEN, newUser);
    expect(response.config.method).toEqual("post");
    expect(response.config.url).toEqual(`${TEST_SERVER_ENDPOINT}${API_PREFIX}/users`);
  });

  test("Test `@PUT` decorator.", async () => {
    const userService = new ServiceBuilder()
      .setEndpoint(TEST_SERVER_ENDPOINT)
      .build(UserService);
    const userId = 1;
    const name = "Johnny";
    const age = 21;
    const country = "US";
    const user = { name, age, country };
    const response = await userService.replaceUser(TOKEN, userId, user);
    expect(response.config.method).toEqual("put");
    expect(response.config.url).toEqual(`${TEST_SERVER_ENDPOINT}${API_PREFIX}/users/${userId}`);
  });

  test("Test `@PATCH` decorator.", async () => {
    const userService = new ServiceBuilder()
      .setEndpoint(TEST_SERVER_ENDPOINT)
      .build(UserService);
    const userId = 1;
    const age = 21;
    const user = { age };
    const response = await userService.updateUser(TOKEN, userId, user);
    expect(response.config.method).toEqual("patch");
    expect(response.config.url).toEqual(`${TEST_SERVER_ENDPOINT}${API_PREFIX}/users/${userId}`);
  });

  test("Test `@DELETE` decorator.", async () => {
    const userService = new ServiceBuilder()
      .setEndpoint(TEST_SERVER_ENDPOINT)
      .build(UserService);
    const userId = 1;
    const response = await userService.deleteUser(TOKEN, userId);
    expect(response.config.method).toEqual("delete");
    expect(response.config.url).toEqual(`${TEST_SERVER_ENDPOINT}${API_PREFIX}/users/${userId}`);
  });

  test("Test `@HEAD` decorator.", async () => {
    const userService = new ServiceBuilder()
      .setEndpoint(TEST_SERVER_ENDPOINT)
      .build(UserService);
    const userId = 1;
    const response = await userService.headUser(TOKEN, userId);
    expect(response.config.method).toEqual("head");
    expect(response.config.url).toEqual(`${TEST_SERVER_ENDPOINT}${API_PREFIX}/users/${userId}`);
  });

  test("Test `@PathParam` decorator.", async () => {
    const userService = new ServiceBuilder()
      .setEndpoint(TEST_SERVER_ENDPOINT)
      .build(UserService);
    const userId = 1;
    const response = await userService.getUser(TOKEN, userId);
    expect(response.config.url).toEqual(`${TEST_SERVER_ENDPOINT}${API_PREFIX}/users/${userId}`);
  });

  test("Test `@QueryMap` decorator.", async () => {
    const searchService = new ServiceBuilder()
      .setEndpoint(TEST_SERVER_ENDPOINT)
      .build(SearchService);
    const query: SearchQuery = {
      title: "TypeScript",
      author: "John Doe",
    };
    const response = await searchService.search(TOKEN, query);
    expect(response.config.url).toEqual(`${TEST_SERVER_ENDPOINT}${API_PREFIX}/search`);
    expect(response.config.params).toMatchObject(query);
  });

  test("Test `@Body` decorator.", async () => {
    const userService = new ServiceBuilder()
      .setEndpoint(TEST_SERVER_ENDPOINT)
      .build(UserService);
    const newUser: User = {
      name: "Jane",
      age: 18
    };
    const response = await userService.createUser(TOKEN, newUser);
    expect(response.config.data).toEqual(JSON.stringify(newUser));
  });

  test("Test `@Headers` decorator.", async () => {
    const authService = new ServiceBuilder()
      .setEndpoint(TEST_SERVER_ENDPOINT)
      .build(AuthService);
    const auth: Auth = {
      username: "test",
      password: "123456",
    };
    const response = await authService.auth(auth);
    expect(response.config.headers["Content-Type"]).toEqual("application/x-www-form-urlencoded");
  });

  test("Test `@Header` decorator.", async () => {
    const userService = new ServiceBuilder()
      .setEndpoint(TEST_SERVER_ENDPOINT)
      .build(UserService);
    const response = await userService.getUsers(TOKEN);
    expect(response.config.headers["X-Token"]).toEqual(TOKEN);
  });
});
