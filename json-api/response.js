class JsonApiResponse {
  constructor () {
    this.errors = []
    this.body = null
    this.status = 200
  }

  addError (error) {
    this.errors.push(error)
  }

  getResponse () {
    if (this.errors.length > 0) {
      return { errors: this.errors }
    } else {
      return { data: this.body }
    }
  }
}

module.exports = new JsonApiResponse()
