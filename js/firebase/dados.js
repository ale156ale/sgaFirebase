'use strict'; // modo estrito

/**
 * obtemDados.
 * Obtem dados da collection a partir do Firebase.
 * @param {string} collection - Nome da collection no Firebase
 * @return {object} - Uma tabela com os dados obtidos
 */
async function obtemDados(collection) {
    let spinner = document.getElementById('carregandoDados');
    let tabela = document.getElementById('tabelaDados');

    firebase.database().ref(collection).orderByChild('nome').on('value', (snapshot) => {
        tabela.innerHTML = '';
        tabela.innerHTML += `<tr>    
            <th>Nome</th>
            <th>CPF</th>
            <th>Turma</th>
            <th>1º Nota</th>
            <th>2ª Nota</th>
            <th>3ª Nota</th>
            <th>4ª Nota</th>
            <th>Média Final</th>
            <th>Status</th>
        </tr>`;

        let alunoCount = 0;
        let alunoAprovado = 0;
        let alunoReprovado = 0;

        snapshot.forEach(item => {
            if (item.val().privilegio === 'aluno') {
                alunoCount++;

                // Criando as novas linhas na tabela
                let novaLinha = tabela.insertRow();
                novaLinha.insertCell().innerHTML = '<small class="text-dark">' + item.val().usuario + '</small>';
                novaLinha.insertCell().innerHTML = '<small class="text-dark">' + item.val().cpf + '</small>';
                novaLinha.insertCell().innerHTML = '<small class="text-dark">' + item.val().turma + '</small>';

                // Obtendo e formatando as notas
                let nota1 = parseFloat(item.val().nota1);
                let nota2 = parseFloat(item.val().nota2);
                let nota3 = parseFloat(item.val().nota3);
                let nota4 = parseFloat(item.val().nota4);

                // Função para criar célula com classe e conteúdo formatado
                function createCellWithClass(row, value) {
                    let cell = row.insertCell();
                    cell.textContent = new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2 }).format(value);
                    cell.className = 'text-dark';
                }

                // Criando células com notas formatadas
                createCellWithClass(novaLinha, nota1);
                createCellWithClass(novaLinha, nota2);
                createCellWithClass(novaLinha, nota3);
                createCellWithClass(novaLinha, nota4);

                // Calculando e formatando a média
                let media = (nota1 + nota2 + nota3 + nota4) / 4;
                createCellWithClass(novaLinha, media);

                let statusCell = novaLinha.insertCell();
                if (media >= 5) {
                    statusCell.innerHTML = '<span class="btn btn-success btn-xs">Aprovado</span>';
                    alunoAprovado++;
                } else {
                    statusCell.innerHTML = '<span class="btn btn-danger btn-xs">Reprovado</span>';
                    alunoReprovado++;
                }
            }
        });

        let rodape = tabela.insertRow();
        rodape.className = 'fundo-laranja-claro';
        let celulaRodape = rodape.insertCell();
        celulaRodape.colSpan = "9";
        celulaRodape.innerHTML = alunoCount === 0
            ? '⚠️ Ainda não há nenhum registro cadastrado!'
            : `<span class="green_color">Aprovados: <strong> ${alunoAprovado} </span></strong> <span class="red_color">Reprovados: <strong> ${alunoReprovado} </span></strong> <span class="blue1_color">Total: <strong> ${alunoCount} </span></strong>`;
        spinner.classList.add('d-none'); // oculta o carregando...
    }); 

    contarAlunos(collection);
    contarAprovados(collection);
    contarReprovados(collection);
    contarDocentes(collection);
}

/**
 * Filtra os elementos de uma tabela com base no valor inserido em um campo de filtro.
 *
 * @param {string} idFiltro - O ID do campo de filtro de entrada.
 * @param {string} idTabela - O ID da tabela que será filtrada.
 */
function filtrarTabela(idFiltro, idTabela) {
    var input, filter, table, tr, td, i, j, txtValue;
    input = document.getElementById(idFiltro);
    filter = input.value.toUpperCase();
    table = document.getElementById(idTabela);
    tr = table.getElementsByTagName("tr");

    for (i = 1; i < tr.length; i++) {
        tr[i].style.display = "none"; // Oculte todas as linhas do corpo da tabela inicialmente.
        for (j = 0; j < tr[i].cells.length; j++) {
            td = tr[i].cells[j];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = ""; // Exiba a linha se houver correspondência.
                    break; // Saia do loop interno quando encontrar uma correspondência.
                }
            }
        }
    }
}

/**
 * contarUsuarios.
 * Retornar a contagem do total de registros na collection informada
 * @param {string} collection - Nome da collection no Firebase
 * @return {null}
 */
function contarUsuarios(collection) {
    firebase.database().ref(collection).on('value', (snap) => {
        let usuarios = snap.numChildren();
        document.getElementById('totalUsuarios').innerHTML = usuarios;
    });
}

/**
 * contarAlunos
 * Retornar a contagem do total de registros na collection informada
 * @param {string} collection - Nome da collection no Firebase
 * @return {null}
 */
function contarAlunos(collection) {
    firebase.database().ref(collection).on('value', (snap) => {
        let contadorAlunos = 0;
        snap.forEach((item) => {
            if (item.val().privilegio === 'aluno') {
                contadorAlunos++;
            }
        });
        document.getElementById('totalAlunos').innerHTML = contadorAlunos;
    });
}

/**
 * contarDocentes
 * Retornar a contagem do total de registros na collection informada
 * @param {string} collection - Nome da collection no Firebase
 * @return {null}
 */
function contarDocentes(collection) {
    firebase.database().ref(collection).on('value', (snap) => {
        let contadorDocentes = 0;
        snap.forEach((item) => {
            if ((item.val().privilegio === 'docente') || (item.val().privilegio === 'administrador')) {
                contadorDocentes++;
            }
        });
        document.getElementById('totalDocentes').innerHTML = contadorDocentes;
    });
}

/**
 * contarAprovados
 * Retornar a contagem do total de registros aprovados da collection informada
 * @param {string} collection - Nome da collection no Firebase
 * @return {null}
 */
function contarAprovados(collection) {
    firebase.database().ref(collection).on('value', (snap) => {
        let aprovados = 0;
        snap.forEach(item => {
            if (item.val().privilegio === 'aluno') {
                let nota1 = parseFloat(item.val().nota1);
                let nota2 = parseFloat(item.val().nota2);
                let nota3 = parseFloat(item.val().nota3);
                let nota4 = parseFloat(item.val().nota4);
                let media = (nota1 + nota2 + nota3 + nota4) / 4;
                if (media >= 5) {
                    aprovados++;
                }
            }
        });
        document.getElementById('totalAprovados').innerHTML = aprovados;
    });
}

/**
 * contarReprovados
 * Retornar a contagem do total de registros reprovados da collection informada
 * @param {string} collection - Nome da collection no Firebase
 * @return {null}
 */
function contarReprovados(collection) {
    firebase.database().ref(collection).on('value', (snap) => {
        let reprovados = 0;
        snap.forEach(item => {
            if (item.val().privilegio === 'aluno') {
                let nota1 = parseFloat(item.val().nota1);
                let nota2 = parseFloat(item.val().nota2);
                let nota3 = parseFloat(item.val().nota3);
                let nota4 = parseFloat(item.val().nota4);
                let media = (nota1 + nota2 + nota3 + nota4) / 4;
                if (media < 5) {
                    reprovados++;
                }
            }
        });
        document.getElementById('totalReprovados').innerHTML = reprovados;
    });
}

document.getElementById('gerarRelatorio').addEventListener('click', () => {
    gerarPDF();
});


function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let tabela = document.getElementById('tabelaDados');
    let rows = tabela.getElementsByTagName('tr');

    let colunas = [];
    for (let i = 0; i < rows[0].cells.length; i++) {
        colunas.push(rows[0].cells[i].innerText);
    }

    let data = [];
    for (let i = 1; i < rows.length; i++) {
        let row = [];
        for (let j = 0; j < rows[i].cells.length; j++) {
            row.push(rows[i].cells[j].innerText);
        }
        data.push(row);
    }

    // Adiciona o título do relatório
    doc.text('Relatório de Notas dos Alunos', 14, 16);

    // Adiciona a tabela ao PDF
    doc.autoTable({
        head: [colunas],
        body: data,
        startY: 20,
    });

    // Baixa o PDF
    doc.save('relatorio.pdf');
}




// Chamar a função ao carregar a página
document.addEventListener('DOMContentLoaded', (event) => {
    obtemDados('suaColecao');
});
