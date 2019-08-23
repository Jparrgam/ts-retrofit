import * as qs from "qs";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

axios.defaults.withCredentials = true;

export type Response = AxiosResponse;

export class BaseService {
  public __meta__: any;
  private _endpoint: string;
  private _httpClient: HttpClient;
  private _methodMap: Map<string, Function>;

  constructor(serviceBuilder: ServiceBuilder) {
    this._endpoint = serviceBuilder.endpoint;
    this._httpClient = new HttpClient();
    this._methodMap = new Map<string, Function>();

    const methodNames = this._getInstanceMethodNames();
    methodNames.forEach((methodName) => {
      this._methodMap[methodName] = this[methodName];
    });

    const noWrappedMethodNames = [
      "getInstanceMethodNames",
      "_wrap",
      "_resolveData",
    ];

    const self = this;
    for (const methodName of methodNames) {
      const descriptor = {
        enumerable: true,
        configurable: true,
        get(): Function {
          if (noWrappedMethodNames.includes(methodName)) {
            return self._methodMap[methodName];
          }
          const endpoint = self._endpoint;
          const method = self.__meta__[methodName].method;
          const basePath = self.__meta__.basePath;
          const path = self.__meta__[methodName].path;
          const headers = self.__meta__[methodName].headers || {};
          const headerParams = self.__meta__[methodName].headerParams;
          const pathParams = self.__meta__[methodName].pathParams;
          const queryMapIndex = self.__meta__[methodName].queryMap;
          const bodyIndex = self.__meta__[methodName].body;
          return (...args: any[]) => {
            const url = [endpoint, basePath, path].join("");
            return self._wrap(method, url, headers, headerParams, pathParams, queryMapIndex, bodyIndex, args);
          };
        },
        set(value: Function) {
          self[methodName] = value;
        },
      };
      Object.defineProperty(this, methodName, descriptor);
    }
  }

  private _getInstanceMethodNames(): string[] {
    let properties: string[] = [];
    let obj = this;
    do {
      properties = properties.concat(Object.getOwnPropertyNames(obj));
      obj = Object.getPrototypeOf(obj);
    } while (obj);
    return properties.sort().filter((e, i, arr) => {
      return e !== arr[i + 1] && this[e] && typeof this[e] === "function";
    });
  }

  private _wrap(method: string, urlTemplate: string, headers: any, headerParams: any[], pathParams: any[],
                queryMapIndex: number, bodyIndex: number, args: any[]): Promise<Response> {
    let url = urlTemplate;

    const config: AxiosRequestConfig = {
      headers,
      params: {},
    };

    for (const pos in pathParams) {
      if (pathParams[pos]) {
        url = url.replace(new RegExp(`\{${pathParams[pos]}}`), args[pos]);
      }
    }

    for (const pos in headerParams) {
      if (headerParams[pos]) {
        config.headers[headerParams[pos]] = args[pos];
      }
    }

    if (queryMapIndex >= 0) {
      for (const key in args[queryMapIndex]) {
        if (args[queryMapIndex][key]) {
          config.params[key] = args[queryMapIndex][key];
        }
      }
    }

    if (bodyIndex >= 0) {
      config.data = this._resolveData(config.headers, args[bodyIndex]);
    }

    switch (method) {
      case "GET":
        return this._httpClient.get(url, config);
      case "POST":
        return this._httpClient.post(url, config);
      case "PUT":
        return this._httpClient.put(url, config);
      case "PATCH":
        return this._httpClient.patch(url, config);
      case "DELETE":
        return this._httpClient.delete(url, config);
      case "HEAD":
        return this._httpClient.head(url, config);
      default:
        return this._httpClient.get(url, config);
    }
  }

  private _resolveData(headers: any, data: any) {
    if (!headers["Content-Type"]) {
      return data;
    }
    if (headers["Content-Type"] === "application/x-www-form-urlencoded") {
      return qs.stringify(data);
    }
    return data;
  }
}

export class ServiceBuilder {
  private _endpoint: string = "";

  public build<T>(service: new(builder: ServiceBuilder) => T): T {
    return new service(this);
  }

  public setEndpoint(endpoint: string): ServiceBuilder {
    this._endpoint = endpoint;
    return this;
  }

  get endpoint(): string {
    return this._endpoint;
  }
}

class HttpClient {
  public async get(url: string, config: AxiosRequestConfig): Promise<Response> {
    const requestConfig: AxiosRequestConfig = {
      url,
      method: "get",
      ...config,
    };
    return await this._sendRequest(requestConfig);
  }

  public async post(url: string, config: AxiosRequestConfig): Promise<Response> {
    const requestConfig: AxiosRequestConfig = {
      url,
      method: "post",
      ...config,
    };
    return await this._sendRequest(requestConfig);
  }

  public async put(url: string, config: AxiosRequestConfig): Promise<Response> {
    const requestConfig: AxiosRequestConfig = {
      url,
      method: "put",
      ...config,
    };
    return await this._sendRequest(requestConfig);
  }

  public async patch(url: string, config: AxiosRequestConfig): Promise<Response> {
    const requestConfig: AxiosRequestConfig = {
      url,
      method: "patch",
      ...config,
    };
    return await this._sendRequest(requestConfig);
  }

  public async delete(url: string, config: AxiosRequestConfig): Promise<Response> {
    const requestConfig: AxiosRequestConfig = {
      url,
      method: "delete",
      ...config,
    };
    return await this._sendRequest(requestConfig);
  }

  public async head(url: string, config: AxiosRequestConfig): Promise<Response> {
    const requestConfig: AxiosRequestConfig = {
      url,
      method: "head",
      ...config,
    };
    return await this._sendRequest(requestConfig);
  }

  private async _sendRequest(config: AxiosRequestConfig): Promise<Response> {
    try {
      return await axios(config);
    } catch (err) {
      throw err;
    }
  }
}
