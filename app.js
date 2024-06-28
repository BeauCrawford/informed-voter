new Vue({
    el: '#app',
    data() {
      return {
        quizData: null,
        currentQuestionIndex: 0,
        answers: {},
        topicImportance: {},
        partyAlignment: {},
        loading: true,
        importanceOptions: [
          { value: 1, label: "Extremely Important", weight: 1 },
          { value: 0.75, label: "Very Important", weight: 0.75 },
          { value: 0.5, label: "Somewhat Important", weight: 0.5 },
          { value: 0.25, label: "Sort of Important", weight: 0.25 },
          { value: 0, label: "Not Important to me", weight: 0 }
        ]
      };
    },
    created() {
      this.fetchQuizData();
    },
    computed: {
      currentQuestion() {
        return this.getCurrentQuestion();
      }
    },
    methods: {
      fetchQuizData() {
        fetch('quizData.json')
          .then(response => response.json())
          .then(data => {
            this.quizData = data;
            this.initializePartyAlignment();
            this.initializeTopicImportance();
            this.loading = false;
          })
          .catch(error => console.error('Error fetching quiz data:', error));
      },
      initializePartyAlignment() {
        const alignment = {};
        this.quizData.parties.forEach(party => {
          alignment[party.id] = 0;
        });
        this.partyAlignment = alignment;
      },
      initializeTopicImportance() {
        const importance = {};
        this.quizData.topics.forEach(topic => {
          importance[topic.title] = 1; // Default to "Extremely Important"
        });
        this.topicImportance = importance;
      },
      calculatePartyAlignment() {
        const alignment = {};
        this.quizData.parties.forEach(party => {
          alignment[party.id] = 0;
        });
  
        let totalWeight = 0;
  
        this.quizData.topics.forEach((topic, topicIndex) => {
          const topicWeight = this.topicImportance[topic.title] || 0;
          if (topicWeight > 0) {
            topic.questions.forEach((question, questionIndex) => {
              const answerKey = `${topicIndex}-${questionIndex}`;
              const choiceId = this.answers[answerKey];
              if (choiceId) {
                const choice = question.choices.find(c => c.id === choiceId);
                this.quizData.parties.forEach(party => {
                  alignment[party.id] += choice[party.id] * topicWeight;
                });
                totalWeight += topicWeight;
              }
            });
          }
        });
  
        if (totalWeight > 0) {
          this.quizData.parties.forEach(party => {
            alignment[party.id] = (alignment[party.id] / totalWeight) * 100;
          });
        }
  
        this.partyAlignment = alignment;
      },
      handleAnswer(choiceId) {
        const currentQuestion = this.getCurrentQuestion();
        if (currentQuestion) {
          const topicIndex = this.quizData.topics.findIndex(t => t.title === currentQuestion.topic);
          const questionInTopicIndex = this.quizData.topics[topicIndex].questions.findIndex(q => q.question === currentQuestion.question);
          
          this.$set(this.answers, `${topicIndex}-${questionInTopicIndex}`, choiceId);
          this.calculatePartyAlignment();
        }
      },
      handleTopicImportance(topic, value) {
        this.$set(this.topicImportance, topic, parseFloat(value));
        this.calculatePartyAlignment();
      },
      getCurrentQuestion() {
        let questionCount = 0;
        for (const topic of this.quizData.topics) {
          if (this.topicImportance[topic.title] > 0) {
            if (questionCount + topic.questions.length > this.currentQuestionIndex) {
              return { ...topic.questions[this.currentQuestionIndex - questionCount], topic: topic.title };
            }
            questionCount += topic.questions.length;
          }
        }
        return null;
      },
      navigateQuestion(direction) {
        const newIndex = this.currentQuestionIndex + direction;
        if (newIndex >= 0 && newIndex < this.getTotalQuestions()) {
          this.currentQuestionIndex = newIndex;
        }
      },
      getTotalQuestions() {
        return this.quizData.topics.reduce((sum, topic) => 
          sum + (this.topicImportance[topic.title] > 0 ? topic.questions.length : 0), 0);
      },
      getCurrentAnswer() {
        const currentQuestion = this.getCurrentQuestion();
        if (!currentQuestion) return null;
        const topicIndex = this.quizData.topics.findIndex(t => t.title === currentQuestion.topic);
        const questionInTopicIndex = this.quizData.topics[topicIndex].questions.findIndex(q => q.question === currentQuestion.question);
        return this.answers[`${topicIndex}-${questionInTopicIndex}`];
      }
    }
  });
  