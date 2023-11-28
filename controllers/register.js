const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body
  if (!email || !name || !password) {
    return res.status(400).json('Invalid form submission')
  }
  const hash = bcrypt.hashSync(password)

  db.select('*').from('users').where('email', '=', email)
    .then(user => {
      if (user.length) {
      res.status(400).json('User already exists')
      } else {
      db.transaction(trx => {
        trx.insert({
          hash: hash,
          email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
          return trx('users').insert({
            email: loginEmail[0].email,
            name: name,
            joined: new Date()
          })
          .returning('*')
          .then(user => {
            res.json(user[0])
          })
        })
        .then(trx.commit)
        .catch(trx.rollback)
      })
    }
  })
  .catch(err => res.status(400).json('Unable to register'))
    
}

module.exports = {
  handleRegister: handleRegister
}