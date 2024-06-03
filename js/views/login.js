
 'use strict' //modo estrito


 // Atalhos para os elementos DOM - Document Object Model
const formLogin = document.getElementById('formLogin')

//Adiciona um Listener em cada item
formLogin.addEventListener('submit', (event) => {
  event.preventDefault()
  const email = document.getElementById('email').value
  const senha = document.getElementById('senha').value
  loginFirebase(email, senha)
}
)


