class UserError extends Error {
  constructor(...args) {
    super(...args);

    this.name = this.constructor.name;
    [this.message] = args;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(...args)).stack;
    }
  }
}

export default UserError;
