const mongoose = require('mongoose')


if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2]
const url = 
  `mongodb://ruiyot:${password}@ac-hucrdzr-shard-00-00.shqe2cw.mongodb.net:27017,ac-hucrdzr-shard-00-01.shqe2cw.mongodb.net:27017,ac-hucrdzr-shard-00-02.shqe2cw.mongodb.net:27017/phonebook?ssl=true&replicaSet=atlas-8m3onc-shard-0&authSource=admin&retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)


const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length < 4) {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person);
    })
    mongoose.connection.close()
  })
} else {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  person.save().then(result => {
    console.log(`added ${person.name} number ${person.number} to phonebook`);
    mongoose.connection.close()
  })
}


