var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();
var path = require('path');


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// definir modelos
var esquemaClient = new mongoose.Schema({
    esq_nome: String,
    esq_login: String,
    esq_senha: String
});

var Modclien = mongoose.model('clientes', esquemaClient);

var esquemaProd = new mongoose.Schema({
    esq_obj: String,
    esq_name: String,
    esq_url: String,
    esq_marca: String,
    esq_preco: String

});

var Modprod = mongoose.model('produtos', esquemaProd);

mongoose.connect("mongodb://localhost/jooja", { useNewUrlParser: true });

app.use(express.static('public'));

//metodos get
app.get(['/', '/index'], function(requisicao, resp) {
    Modprod.find({}, function(err, produtos) {
        if (produtos == null) {
            resp.render('erro');
        } else {
            resp.render('index', { prods: produtos });
        }
    });
});

app.get(['/cadastro'], function(requisicao, resp) {
    resp.render('cadastro');
});

app.get(['/login'], function(requisicao, resp) {
    resp.render('login');
});

app.get(['/usuario'], function(requisicao, resp) {
    resp.render('usuario');
});

app.get(['/termos'], function(requisicao, resp){
    resp.sendFile(path.join(__dirname + '/public/termos.html'));
});

//metodos post
//metodo post para busca

app.post(['/busca'], function(requisicao, resp) {
    var termo_proc = requisicao.body.busca_usuario;

    Modprod.findOne({ esq_name: termo_proc }, function(err, busca) {
        if (busca == null) {
            Modprod.find({ esq_obj: termo_proc }, function(err, produto) {
                if (err) {
                    resp.render('index');
                }
                else{
                    resp.render('objetos', {resposta: produto});//pag de objetos?

                }
            })

        } else {
            Modprod.find({ 'esq_name': termo_proc }, function(err, produtos) {
                if (produtos == null) {
                    resp.render('index')
                } else {
                    resp.render('objetos', {resposta: produtos});
                }
            });

        }

    });


});

app.post(['/cadastro'], function(requisicao, resp) {
    var nome = requisicao.body.nome;
    var login = requisicao.body.login;
    var senha = requisicao.body.senha;

    var novoclien = new Modclien({
        esq_nome: nome,
        esq_login: login,
        esq_senha: senha
    });


    Modclien.findOne({'esq_login': login}, function(err, usuario){
      if (usuario == null){

        novoclien.save(function(err){
            if(err){
                resp.render('erro');
            }else{
              Modprod.find({}, function(err, produtos){
                  if (produtos == null){
                      resp.render('erro');
                  }
                  else{
                      resp.render('index',{prods: produtos});
                  }
              });
            }
        });
      }else{
        resp.render('cadastro');
      }
    });


});

//post para login
app.post(['/login'], function(requisicao, resp) {
    var login = requisicao.body.login;
    var senha = requisicao.body.senha;

    Modclien.find({ 'esq_login': login, 'esq_senha': senha }, function(err, usuario) {
        if (usuario == null) {
            resp.render('erro')
        } else {
            Modprod.find({ 'esq_name': usuario[0].esq_nome }, function(err, produtos) {
                if (produtos == null) {
                    resp.render('erro')
                } else {
                    resp.render('usuario', { usuarios: usuario, lista: produtos });
                }
            });
        }
    });


});
//post para cadastrar produto

app.post(['/cadastroprod'], function(requisicao, resp) {
    var nome = requisicao.body.nome;
    var img = requisicao.body.img;
    var marca = requisicao.body.marca;
    var preco = requisicao.body.preco;
    var nome_user = requisicao.body.nome_user;

    Modclien.find({ 'esq_login': nome_user }, function(err, usuario) {
        if (usuario == null) {
            resp.render('erro')
        } else {
            var novoprod = new Modprod({
                esq_obj: nome,
                esq_name: nome_user,
                esq_url: img,
                esq_marca: marca,
                esq_preco: preco
            });

            novoprod.save(function(err) {
                if (err) {
                    resp.render('erro');
                } else {
                    Modprod.find({ 'esq_name': usuario[0].esq_nome }, function(err, produtos) {
                        if (produtos == null) {
                            resp.render('erro')
                        } else {
                            console.log(produtos);
                            resp.render('usuario', { usuarios: usuario, lista: produtos });
                        }
                    });
                }
            });
        }
    });

});



//criado server

var servidor = http.createServer(app);
servidor.listen(8080);
console.log("Servidor Rodando...");
