/**
 * A class to handle responses and format them in JSON API format
 */
class JsonApiResponse {
  constructor () {
    this.errors = []
    this.body = null
    this.status = 200
  }

  /**
   * Adds an error to the errors array
   * @param {String} error
   */
  addError (error) {
    this.errors.push(error)
  }

  /**
   * Formats a response according to JSONAPI standard
   */
  getResponse () {
    if (this.errors.length > 0) {
      return { errors: this.errors }
    } else {
      return { data: this.body }
    }
  }
}

// creates a singleton instance to use throughout api
module.exports = new JsonApiResponse()
