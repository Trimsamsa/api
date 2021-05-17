const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');


const db = knex({
	client : 'pg',
	connection : {
		host : '127.0.0.1',
		user : 'aman',
		password : '',
		database : 'amandb'
	}
});

// console.log(db.select('*').from('users'));
db.select('*').from('users').then(data=>{
	console.log(data);
});

app.use(cors())


app.use(bodyParser.json());

// const database = {
// 	users : [
// 	{   
// 		id : '123',
// 		name : 'aman',
// 		email : 'aman@mail.com',
// 		password : '12345',
// 		entries : 0,
// 		joined : new Date()
// 	},

//     {
//     	id : '124',
//     	name : 'sally',
//     	email : 'sally@mail.com',
//     	password : 'sally',
//     	entries : 0,
//     	joined : new Date()
//     }

// 	]
// 	// login : [
// 	// { 
//  //       id : '987',
//  //       hash: '',
//  //       email : 'elliot@mail.com'
//  //    }
// 	// ]
// }

app.listen(3003,()=>{
	console.log('app is running on port 3003');
})

app.get('/',(req,res)=>{
	res.send(database.users)
})


app.post('/signin',(req,res)=>{
	db.select('email','hash').from('login')
	.where('email','=',req.body.email)
	.then(data=>{
		const isValid = bcrypt.compareSync(req.body.password,
			data[0].hash);
		if(isValid){
			return db.select('*').from('users')
			.where('email','=',req.body.email)
			.then(user=>{
				res.json(user[0])
			})
		.catch(err=> res.status(400).
			json('unable to get user'))
		} else {
			res.status(400).json('wrong credentials')
		}
	})

})

	// bcrypt.compare('2', '$2a$10$VOmhSa5Cr.r04ikdH9RrdO8CWdVSJRnhqi4pmqX3WT2xMe0gDIkjm',
	// 	function(err,res){
	// 		console.log('first guess',res)
	// });

	// bcrypt.compare('veggie','$2a$10$VOmhSa5Cr.r04ikdH9RrdO8CWdVSJRnhqi4pmqX3WT2xMe0gDIkjm',
	// 	function(err,res){
	// 		console.log('second guess',res)
	// 	});

// 	if(req.body.email === database.users[2].email &&
// 		req.body.password === database.users[2].password){
// 		res.json('success');
// 	} else { 
//         res.status(400).json('error logging in');
// 	}
// })

app.post('/register',(req,res)=>{
	const {email,name,password}=req.body;
	const hash = bcrypt.hashSync(password);
	db.transaction(trx=>{
		trx.insert({
			hash : hash,
			email : email
		})
		.into('login')
		.returning('email')
		.then(loginEmail=>{
			return trx('users')
			.returning('*')
			 .insert({
				email : loginEmail[0],
				name : name,
				joined : new Date()
			})
			.then(user=>{
				res.json(user[0]);
			})
		})
	.then(trx.commit)
	.catch(trx.rollback)
  })
   .catch(err=>res.status(400)
   	.json('unable to register'))
})

// 	// bcrypt.hash(password,null,null,function(err,hash){
// 	// 	console.log(hash);
// 	// })
// 	db('users')
//     .returning('*')
// 	.insert({
// 		name : name,
// 		email : email,
// 		joined : new Date()
// 	})
// 	.then(user=>{
// 		res.json(user[0]);
// 	})
// 	.catch(err=>res.status(400).json('unable to register'))
// })



app.get('/profile/:id',(req,res)=>{
	const{id}=req.params;
    db.select('*').from('users').where({id})
    .then(user=>{
    	if(user.length){ 
    	res.json(user[0])
    } else {
    	res.status(400).json('Not Found')
    }
   })
    .catch(err=>res.status(400).json('error getting user'))
})

// 	let found = false;
// 	database.users.forEach(user=>{
// 		if(user.id===id){
// 			res.json(user);
// 		} 
// 	})
// 	if(!found) {
// 			res.status(404).json('not found');
// 		}
// })

app.put('/image',(req,res)=>{
	const {id} = req.body;
 	db('users').where('id','=',id)
 	.increment('entries',1)
 	.returning('entries')
 	.then(entries=>{
 		res.json(entries[0]);
 	})
 	.catch(err=>res.status(400).json('unable to get entries'))
})


// 	let found = false;
// 	database.users.forEach(user=>{
// 		if(user.id===id){
// 			found=true;
// 			user.entries++
// 			return res.json(user.entries);
// 		}
// 	})
// 	if(!found){
// 		res.status(400).json('not found');
// 	}
// })