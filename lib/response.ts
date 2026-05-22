export class ErrorResponse extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErrorResponse";
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
    };
  }
}
