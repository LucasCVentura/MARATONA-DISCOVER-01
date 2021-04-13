//Objeto responsável pela abertura e fechamento do modal ''+ Nova transação'' 
const Modal = {
    
    
    open(){
        const modal = document.querySelector('.modal-overlay');

        modal.classList.add('active');
        
    },

    close(){
        const modal = document.querySelector('.modal-overlay');

        modal.classList.remove('active');
    },

   
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },
    set(transactions) {
        localStorage.setItem("dev.finaces:transactions", JSON.stringify(transactions));
    },
}

//Objeto responsável pelas transações, entradas e saídas
const Transaction = {
    //Atalho para transactions
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);
        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },
    //Somar as entradas
    incomes() {
        let sum = 0;
        Transaction.all.forEach(transaction => {
           if(transaction.amount > 0){
               sum = sum + transaction.amount;
           }
            
        })

        return sum;
        
    },
    //Somar as saídas
    expenses() {
        let subtraction = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0){
                subtraction = subtraction + transaction.amount;
            }
        })
        return subtraction;
    },

    //Entradas - Saídas
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}
//Objeto que controla os elementos da DOM, como adicionar html etc
const DOM = {
    //Selecionando o corpo da tabela
    transacionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        
        //Cria a linha da tabela
        const tr = document.createElement('tr');
        //Linha criada está recebendo as informações da transação
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        //Corpo da tabela selecionado(t-body), e adicionando a linha criada, com as informações da transação
        tr.dataset.index = index; 
        DOM.transacionsContainer.appendChild(tr);
    },
    
    //Substitui os elementos HTML estáticos, via js
    innerHTMLTransaction(transaction, index) {
        //Verifica se, o valor é maior que 0 para adicionar a cor verde(income) ou vermelha(expense)
        const CSSclass = transaction.amount > 0 ? "income" : "expense";
        //Recebo na const amount o valor já formatado e substituo abaixo no html
        const amount = Utils.formateCurrency(transaction.amount)

        const html = 
        `
            
                <td class="description">${transaction.description}</td>
                <td class="${CSSclass}">${amount}</td>
                <td class="date">${transaction.date}</td>
                <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover"></td>
            

        `;

        return html;
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formateCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formateCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formateCurrency(Transaction.total());
    },

    clearTransactions() {
        DOM.transacionsContainer.innerHTML = "";
    }
}

//Coisas uteis a app
const Utils = {
    //Transforma o dado recebido, seja ele String ou Number para o formato BRL
    formateCurrency(value) {
        //Verifica se o valor recebido é maior ou menor que 0
        const signal = Number(value) < 0 ? "-" : "";
        //Remove tudo que não numero
        value = String(value).replace(/\D/g, "");
        //Divide por 100, para acertar o valor
        value = Number(value) / 100;
        //Trasnformo o valor para BRL utilizando a função toLocaleString()
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        return signal + value;
    },

    formatAmount(value) {
        value = value * 100;
        return Math.round(value);
    },

    formatDate(date){
        const splitedDate = date.split("-");
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`;
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues();

        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos");
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    

    submit(event){
        event.preventDefault();
       
        

        try {
            //Validar se os campos estão vazios
            Form.validateFields();
            //Valores formatados do form
            const transaction = Form.formatValues();
            //Salvando os dados do form
            Transaction.add(transaction);
            //Apagando todos os dados do formulário
            Form.clearFields();
            //Fechar o Modal
            Modal.close();
        } catch (error) {
            alert(error.message);
        }
       
       
    }
}



const App = {
    init() {
        //Percorre todo o array transaction, e para cada obejto(transaction) adiciona no método.
        Transaction.all.forEach((transaction, index) => {DOM.addTransaction(transaction, index)});

        DOM.updateBalance();

        Storage.set(Transaction.all);

        

    },
    reload() {
        DOM.clearTransactions();
        App.init();
    }
}



App.init();





