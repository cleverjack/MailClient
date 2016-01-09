var POP3Client = require('poplib');

var host = 'pop.qq.com';
var port = 995;
var username = 'qqcode@qq.com';
var password = 'authcode';
//首先建立连接
var client = new POP3Client(port, host, {
      tlserrs: false, //是否忽略tls errors
      enabletls: true, //传输层安全协议ssl
      debug: true //是否在console输出命令和响应信息
});
//network error handler
client.on('error', function(err){
      if(err.errno === 111){
            console.log('Unable to connect to server.');
      }else{
            console.log('Server error occurred.');
      }
      //console错误
      console.log(err);
});
//state invalid handler 处理状态与命令不一致的情况
client.on('invalid-state', function(cmd){
      console.log('Invalid state. You tried calling ', cmd);
});
//locked handler 处理多命令同时进行的问题
client.on('locked', function(cmd){
      console.log('Current conmand has not finished yet. You tried calling ', cmd);
});

//connect to the remote server
client.on('connect', function(){
      console.log('CONNECT success');
  //成功建立连接后进入AUTHORIZATION状态，进行身份认证
      client.login(username, password);
});
/**
 * Successfully login
 */
//login handler status Boolean
client.on('login', function(status, rawdata){
      if(status){
            console.log('LOGIN/PASS success.');
            //获取邮件列表
            client.list();
      }else{
            console.log('ERR: LOGIN/PASS failed');
            client.quit();
      }
});
//LIST handler
client.on('list', function(status, msgcount, msgnumber, data, rawdata){
      if(status === false){
            console.log('LIST failed');
            //获取失败，退出服务
            client.quit();
      }else{
            console.log('LIST success with', msgcount, ' element(s).');
            if(msgcount > 0){
      //获取第一封邮件
                  client.retr(1);
            }
      }
});
//RETR handler
client.on('retr', function(status, msgnumber, data, rawdata){
      if(status === true){
            console.log('RETR success', msgnumber);
    //获得后，输出data数据
    console.log('data is ', data);
            client.quit();
      }else{
            console.log('ERR: RETR failed for msgnumber', msgnumber);
      }
});
//QUIT handler
client.on('quit', function(status, rawdata){
      if(status === true){
            console.log('QUIT success');
            process.exit(0);
      }else{
    console.log('ERR: QUIT failed.');
            process.exit(0);
      }
});