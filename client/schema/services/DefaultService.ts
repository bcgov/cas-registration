/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NaicsCodeSchema } from "../models/NaicsCodeSchema";
import type { OperationIn } from "../models/OperationIn";
import type { OperationOut } from "../models/OperationOut";
import type { OperatorOut } from "../models/OperatorOut";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class DefaultService {
  /**
   * List Naics Codes
   * @returns NaicsCodeSchema OK
   * @throws ApiError
   */
  public static registrationApiListNaicsCodes(): CancelablePromise<
    Array<NaicsCodeSchema>
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/registration/naics_codes",
    });
  }

  /**
   * List Operations
   * @returns OperationOut OK
   * @throws ApiError
   */
  public static registrationApiListOperations(): CancelablePromise<
    Array<OperationOut>
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/registration/operations",
    });
  }

  /**
   * Create Operation
   * @param requestBody
   * @returns any OK
   * @throws ApiError
   */
  public static registrationApiCreateOperation(
    requestBody: OperationIn,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/registration/operations",
      body: requestBody,
      mediaType: "application/json",
    });
  }

  /**
   * Get Operation
   * @param operationId
   * @returns OperationOut OK
   * @throws ApiError
   */
  public static registrationApiGetOperation(
    operationId: number,
  ): CancelablePromise<OperationOut> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/registration/operations/{operation_id}",
      path: {
        operation_id: operationId,
      },
    });
  }

  /**
   * Update Operation
   * @param operationId
   * @param requestBody
   * @returns any OK
   * @throws ApiError
   */
  public static registrationApiUpdateOperation(
    operationId: number,
    requestBody: OperationIn,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/registration/operations/{operation_id}",
      path: {
        operation_id: operationId,
      },
      body: requestBody,
      mediaType: "application/json",
    });
  }

  /**
   * List Operators
   * @returns OperatorOut OK
   * @throws ApiError
   */
  public static registrationApiListOperators(): CancelablePromise<
    Array<OperatorOut>
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/registration/operators",
    });
  }
}
