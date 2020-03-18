const Fanfou = require("fanfou-sdk");

const fanfou = (key, secret, username, password)=>{
  const ff= new Fanfou({
    consumerKey: key,
    consumerSecret: secret,
    username: username,
    password: password
  });
  return ff
}
const login = async (key, secret, username, password) => {
  const ff = fanfou(key, secret, username, password)
  await ff.xauth()
  const profile = await ff.get('/account/verify_credentials')
  return profile
}
const timeline = async(key, secret, username, password)=>{
  const ff = fanfou(key, secret, username, password)
  await ff.xauth()
  const tl = await ff.get('/statuses/home_timeline',{count:10});
  return tl 
}
const status = async(key, secret, username, password,content)=>{
  const ff = fanfou(key, secret, username, password)
  await ff.xauth()
  const msg = await ff.post('/statuses/update',{status:content})
  return msg
}
module.exports = {
  login,timeline,status
}