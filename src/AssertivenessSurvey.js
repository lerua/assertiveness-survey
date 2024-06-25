import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const questions = [
    "Je dis souvent oui, alors que je voudrais dire non.",
    "Je défends mes droits, sans empiéter sur ceux des autres.",
    "Je préfère dissimuler ce que je pense ou ressens, si je ne connais pas bien la personne.",
    "Je suis plutôt autoritaire et décidé...",
    "Il est en général plus facile et habile d'agir par personne interposé que directement.",
    "Je ne crains pas de critiquer et de dire aux gens ce que je pense.",
    "Je n'ose pas refuser certaines tâches qui manifestement ne relèvent pas de mon attribution.",
    "Je ne crains pas de donner mon opinion, même en face d'interlocuteurs hostiles...",
    "Quand il y a débat, je préfère me tenir en retrait pour voir comment cela va tourner.",
    "On me reproche parfois d'avoir l'esprit de contradiction.",
    "J'ai du mal à écouter les autres.",
    "Je m'arrange pour être dans le secret des dieux ; cela m'a bien rendu service.",
    "On me considère en général comme assez malin et habile dans les relations.",
    "J'entretiens avec les autres des rapports fondés sur la confiance plutôt que sur la domination ou le calcul.",
    "Je préfère ne pas demander de l'aide à un collègue ; il risquerait de penser que je ne suis pas compétent.",
    "Je suis timide et je me sens bloqué dès que je dois réaliser une action inhabituelle.",
    "On me dit « soupe au lait » ; je m'énerve et cela fait rire les autres.",
    "Je suis à l'aise dans les contacts « face à face ».",
    "Je joue assez souvent la comédie : comment faire autrement pour arriver à ses fins ?",
    "Je suis bavard et je coupe la parole aux autres sans m'en rendre compte.",
    "J'ai de l'ambition et je suis prêt à faire ce qu'il faut pour arriver.",
    "Je sais en général qui il faut voir et quand il faut le voir : c'est important pour réussir.",
    "En cas de désaccord, je recherche les compromis réalistes sur la base des intérêts mutuels.",
    "Je préfère « jouer cartes sur table ».",
    "J'ai tendance à remettre à plus tard ce que je dois faire.",
    "Je laisse souvent un travail en train sans le terminer.",
    "En général, je me présente tel que je suis, sans dissimuler mes sentiments.",
    "Il en faut beaucoup pour m'intimider.",
    "Faire peur aux autres est souvent un bon moyen de prendre le pouvoir.",
    "Quand je me suis fait avoir une fois, je sais prendre ma revanche à l'occasion",
    "Pour critiquer quelqu'un, il est efficace de lui reprocher de ne pas suivre ses propres principes. Il est forcément d'accord.",
    "Je sais tirer parti du système : je suis débrouillard.",
    "Je suis capable d'être moi-même, tout en continuant d'être accepté socialement.",
    "Quand je ne suis pas d'accord, j'ose le dire sans passion et me faire entendre.",
    "J'ai le souci de ne pas importuner les autres.",
    "J'ai du mal à prendre parti et à choisir.",
    "Je n'aime pas à être la seule personne de mon avis dans un groupe : dans ce cas, je préfère me taire.",
    "Je n'ai pas peur de parler en public.",
    "La vie n'est que rapport de force et lutte.",
    "Je n'ai pas peur de relever des défis dangereux et risqués.",
    "Créer des conflits peut être plus efficace que réduire des tensions.",
    "Jouer la franchise est un bon moyen pour mettre en confiance.",
    "Je sais écouter et je ne coupe pas la parole.",
    "Je mène jusqu'au bout ce que j'ai décidé de faire.",
    "Je n'ai pas peur d'exprimer mes sentiments tels que je les ressens.",
    "Je sais bien en faire adhérer les gens et les amener à mes idées.",
    "Flatter tout un chacun reste encore un bon moyen d'obtenir ce que l'on veut.",
    "J'ai du mal à maîtriser mon temps de parole.",
    "Je sais manier l'ironie mordante.",
    "Je suis serviable et facile à vivre ; parfois même je me fais un peu exploiter.",
    "J'aime mieux observer que participer.",
    "Je préfère être dans la coulisse qu'au premier rang.",
    "Je ne pense pas que la manipulation soit une solution efficace.",
    "Il ne faut pas annoncer trop vite ses intentions, c'est maladroit.",
    "Je choque souvent les gens par mes propos.",
    "Je préfère être loup plutôt qu'agneau.",
    "Manipuler les gens est souvent le seul moyen pratique pour obtenir ce que l'on veut.",
    "Je sais en général protester avec efficacité, sans agressivité excessive.",
    "Je trouve que les problèmes ne peuvent être vraiment résolus sans en chercher les causes profondes.",
    "Je n'aime pas me faire mal voir."
  ];

const scoringMap = {
  "Fuite Passive": [1, 7, 15, 16, 17, 25, 26, 35, 36, 37, 50, 51, 52, 59, 60],
  "Attaque Agressive": [4, 6, 10, 11, 20, 21, 28, 29, 30, 39, 40, 48, 49, 55, 56],
  "Manipulation": [3, 5, 9, 12, 13, 19, 22, 31, 32, 41, 42, 46, 47, 54, 57],
  "Assertivité": [2, 8, 14, 18, 23, 24, 27, 33, 34, 38, 43, 44, 45, 53, 58],
};

const API_URL = 'http://localhost:3001';

const AssertivenessSurvey = () => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [pastResults, setPastResults] = useState([]);
  const [showPastResults, setShowPastResults] = useState(false);
  const [userName, setUserName] = useState('');

  const calculateScores = useCallback(() => {
    const scores = {};
    Object.entries(scoringMap).forEach(([category, questionIndices]) => {
      scores[category] = questionIndices.reduce((sum, index) => sum + (answers[index - 1] ? 1 : 0), 0);
    });
    return scores;
  }, [answers]);

  const saveResults = useCallback(async () => {
    const scores = calculateScores();
    const newResult = {
      date: new Date().toISOString(),
      scores: scores,
      userName: userName,
    };

    try {
      const response = await fetch(`${API_URL}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newResult),
      });

      if (response.ok) {
        fetchResults(); // Refresh the results list
      } else {
        console.error('Failed to save results');
      }
    } catch (error) {
      console.error('Error saving results:', error);
    }
  }, [calculateScores, userName]);

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    if (currentQuestion >= questions.length) {
      setShowResults(true);
      saveResults();
    }
  }, [currentQuestion, saveResults]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`${API_URL}/results`);
      const data = await response.json();
      setPastResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    setCurrentQuestion(currentQuestion + 1);
  };

  const renderQuestion = () => (
    <motion.div
      key={currentQuestion}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-6 mb-8"
    >
      <h2 className="text-2xl font-bold mb-4">Question {currentQuestion + 1} / {questions.length}</h2>
      <p className="text-lg mb-6">{questions[currentQuestion]}</p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => handleAnswer(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-200"
        >
          Plutôt VRAI
        </button>
        <button
          onClick={() => handleAnswer(false)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition duration-200"
        >
          Plutôt FAUX
        </button>
      </div>
    </motion.div>
  );

  const renderResults = (scores, userName = '') => {
    const data = Object.entries(scores).map(([name, value]) => ({ name, value }));

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">
          Résultats {userName && `de ${userName}`}
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-8 grid grid-cols-2 gap-4">
          {Object.entries(scores).map(([category, score]) => (
            <div key={category} className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">{category}</h3>
              <p className="text-3xl font-bold">{score} / 15</p>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderPastResults = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold mb-4">Tous les résultats</h2>
      {pastResults.map((result, index) => (
        <div key={index} className="mb-8 pb-4 border-b">
          <h3 className="text-xl font-semibold mb-2">
            {result.userName} - {new Date(result.date).toLocaleString()}
          </h3>
          {renderResults(result.scores)}
        </div>
      ))}
    </motion.div>
  );

  const renderUserNameInput = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-6 mb-8"
    >
      <h2 className="text-2xl font-bold mb-4">Entrez votre nom</h2>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        placeholder="Votre nom"
      />
      <button
        onClick={() => setCurrentQuestion(0)}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-200"
        disabled={!userName}
      >
        Commencer le questionnaire
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Autodiagnostic Assertivité</h1>
        {currentQuestion === -1 && renderUserNameInput()}
        {currentQuestion >= 0 && !showResults && !showPastResults && renderQuestion()}
        {showResults && !showPastResults && renderResults(calculateScores(), userName)}
        {showPastResults && renderPastResults()}
        {currentQuestion >= 0 && !showResults && !showPastResults && (
          <div className="mt-8">
            <div className="bg-white rounded-full h-2 w-full">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-center mt-2 text-gray-600">
              {currentQuestion} / {questions.length} questions répondues
            </p>
          </div>
        )}
        <div className="mt-8 flex justify-center space-x-4">
          {!showResults && !showPastResults && currentQuestion >= 0 && (
            <button
              onClick={() => setShowPastResults(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-200"
            >
              Voir tous les résultats
            </button>
          )}
          {(showResults || showPastResults) && (
            <button
              onClick={() => {
                setShowResults(false);
                setShowPastResults(false);
                setCurrentQuestion(-1);
                setAnswers({});
                setUserName('');
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-200"
            >
              Nouveau questionnaire
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssertivenessSurvey;