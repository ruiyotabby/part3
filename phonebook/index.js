require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const { default: mongoose } = require('mongoose')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

morgan.token('body', req => {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  })
})

app.get('/info', async (request, response) => {
  let length
  await Person.find({}).then(persons => length = persons.length)
  response.send(`<p>Phonebook has info for ${length} people<br/>${new Date(Date.now()).toString()}</p>`)
  
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  const person = Person.findById(id).then(returnedPerson => {
    response.json(returnedPerson)
  }).catch(err => next(err))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndRemove(id).then(result => {
    response.status(204).end()
  }).catch(err => next(err))
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Name or number missing'
    })
  }

  const person = new Person ({
    name: body.name,
    number: body.number,
  })

  person.save().then(result => {
    response.status(201).json(result)
    mongoose.connection.close()
  })
  
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
  .then(updatedPerson => {
    response.json(updatedPerson)
  }).catch(err => next(err))
})

const unknownEndpoint = (request, response) => {
  response.status(400).send({ error: 'unknown endpoint'} )
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({error: 'malformatted id'})
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {})