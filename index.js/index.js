document.addEventListener("DOMContentLoaded", function () {
  class Settings {
    constructor() {
      this.settingDom = document.querySelector(".setting");
      this.quizDom = document.querySelector(".quiz");
      this.categoryDom = document.querySelector("#category");
      this.nQuestionDom = document.querySelector("#nQuestions");
      this.startBtn = document.querySelector("#startBtn");
      this.difficulty = [
        document.querySelector("#easy"),
        document.querySelector("#medium"),
        document.querySelector("#hard"),
      ];

      this.startBtn.addEventListener("click", this.startQuizApp.bind(this));
      this.populateCategories();
    }

    populateCategories() {
      fetch("https://opentdb.com/api_category.php")
        .then((response) => response.json())
        .then((data) => this.populateCategoryOptions(data.trivia_categories))
        .catch((error) => console.error("Error fetching categories:", error));
    }

    populateCategoryOptions(categories) {
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        this.categoryDom.appendChild(option);
      });
    }

    startQuizApp = async () => {
      const amount = this.getAmount();
      const categoryID = this.categoryDom.value;
      const difficulty = this.getDifficulty();
      const Url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryID}&difficulty=${difficulty}&type=multiple`;

      try {
        const { results } = await this.fetchData(Url);

        if (results) {
          const shuffledResults = this.shuffleArray(results);

          this.quizDom.style.display = "block";
          this.settingDom.style.display = "none";

          const quiz = new Quiz(shuffledResults);
          quiz.startQuiz();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getAmount = () => {
      const amount = this.nQuestionDom.value;
      if (amount > 0 && amount < 20) {
        return amount;
      } else {
        alert("Please enter the right amount of questions (1-20).");
      }
    };

    getDifficulty = () => {
      const difficulty = this.difficulty.find((element) => element.checked);
      if (difficulty) {
        return difficulty.id;
      } else {
        alert("Please select difficulty");
      }
    };

    fetchData = (Url) => fetch(Url).then((resolve) => resolve.json());

    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  }

  class Quiz {
    constructor(questions) {
      this.questions = questions.map((question) => new Question(question));
      this.currentQuestionIndex = 0;
      this.quizElement = document.querySelector(".quiz");
      this.nextBtn = document.querySelector("#next");
      this.totalElement = document.querySelector(".total");
      this.finalElement = document.querySelector(".final");

      this.nextBtn.addEventListener("click", this.nextQuestion.bind(this));
    }

    startQuiz() {
      this.renderQuestion();
    }

    renderQuestion() {
      const currentQuestion = this.questions[this.currentQuestionIndex];
      currentQuestion.render();

      const currentElement = document.querySelector(".current");
      currentElement.textContent = `Question ${this.currentQuestionIndex + 1}`;
    }

    nextQuestion() {
      const currentQuestion = this.questions[this.currentQuestionIndex];
      currentQuestion.answer();

      this.currentQuestionIndex++;

      if (this.currentQuestionIndex < this.questions.length) {
        this.renderQuestion();
      } else {
        this.endQuiz();
      }
    }

    endQuiz() {
      const correctAnswers = this.questions.filter(
        (question) => question.isCorrect
      ).length;

      this.quizElement.style.display = "none";
      this.finalElement.style.display = "block";

      const scoreElement = document.querySelector(".score");
      scoreElement.textContent = `You answered ${correctAnswers} out of ${this.questions.length} questions correctly.`;

      const againBtn = document.querySelector(".again");
      againBtn.addEventListener("click", this.startAgain.bind(this));
    }

    startAgain() {
      location.reload();
    }
  }

  class Question {
    constructor(question) {
      this.questionElement = document.querySelector("#questions");
      this.answerElements = [
        document.querySelector("#a1"),
        document.querySelector("#a2"),
        document.querySelector("#a3"),
        document.querySelector("#a4"),
      ];
      this.correctAnswer = question.correct_answer;
      this.question = question.question;
      this.isCorrect = false;
      this.answers = this.shuffleArray([
        question.correct_answer,
        ...question.incorrect_answers,
      ]);
    }

    answer() {
      const checkedElement = document.querySelector(
        'input[name="radio"]:checked'
      );
      this.isCorrect =
        checkedElement && checkedElement.value === this.correctAnswer;
    }

    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    render() {
      this.questionElement.innerHTML = this.question;
      this.answerElements.forEach((el, index) => {
        el.innerHTML = `<input type="radio" name="radio" value="${this.answers[index]}"> ${this.answers[index]}`;
      });
    }
  }

  new Settings();
});
