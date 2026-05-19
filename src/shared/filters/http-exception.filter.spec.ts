import type { ArgumentsHost } from "@nestjs/common";
import { HttpExceptionFilter } from "./http-exception.filter";
import { NotFoundException } from "../domain/exceptions/not-found.exception";
import { BusinessRuleException } from "../domain/exceptions/business-rule.exception";

describe("HttpExceptionFilter", () => {
  let filter: HttpExceptionFilter;
  let response: { status: jest.Mock; json: jest.Mock };
  let host: Partial<ArgumentsHost>;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    host = {
      switchToHttp: () =>
        ({
          getResponse: () => response,
        }) as never,
    };
  });

  it("mapeia NotFoundException para 404", () => {
    filter.catch(
      new NotFoundException("Charge", "missing-id"),
      host as ArgumentsHost,
    );
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 404,
      error: "NotFoundException",
      message: 'Charge with id "missing-id" not found',
    });
  });

  it("mapeia BusinessRuleException para 422", () => {
    filter.catch(
      new BusinessRuleException("rule broken"),
      host as ArgumentsHost,
    );
    expect(response.status).toHaveBeenCalledWith(422);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 422,
      error: "BusinessRuleException",
      message: "rule broken",
    });
  });
});
