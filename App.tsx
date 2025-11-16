import React, { useState, useCallback } from 'react';
import { InputData, CalculationResults, ImprovementScenario } from './types';
import { InputGroup } from './components/InputGroup';
import { ResultCard } from './components/ResultCard';

const initialInputData: InputData = {
  totalHours: '',
  productiveHours: '',
  plannedTasks: '',
  completedTasks: '',
  valuePerHour: '',
  estimatedCostPerDistraction: '',
  distractions: '',
  recoveryTime: '',
};

const formatCurrency = (value: number, decimals: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

const App: React.FC = () => {
  const [inputs, setInputs] = useState<InputData>(initialInputData);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [decimals, setDecimals] = useState<number>(2);
  const [showImprovements, setShowImprovements] = useState<boolean>(true);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setShowImprovements((e.target as HTMLInputElement).checked);
    } else {
        setInputs(prev => ({ ...prev, [name]: value }));
    }
  }, []);
  
  const handleReset = useCallback(() => {
    setInputs(initialInputData);
    setResults(null);
  }, []);

  const calculateResults = useCallback(() => {
    const totalHours = parseFloat(inputs.totalHours) || 0;
    const productiveHours = parseFloat(inputs.productiveHours) || 0;
    const plannedTasks = parseFloat(inputs.plannedTasks) || 0;
    const completedTasks = parseFloat(inputs.completedTasks) || 0;
    const valuePerHour = parseFloat(inputs.valuePerHour) || 0;
    const distractions = parseFloat(inputs.distractions) || 0;
    const recoveryTime = parseFloat(inputs.recoveryTime) || 0;

    if (totalHours <= 0) {
      setResults(null);
      return;
    }
    
    // Core Calculations based on new user example
    const productivityRate = (productiveHours / totalHours) * 100;
    const taskCompletionRate = (plannedTasks > 0 ? (completedTasks / plannedTasks) : 0) * 100;
    const timeLost = (distractions * recoveryTime) / 60;
    const valueLost = timeLost * valuePerHour; // Corrected Formula
    const taskEfficiency = productiveHours > 0 ? completedTasks / productiveHours : 0;
    
    // Efficiency Score Calculation (weighted average, normalized to 10) - Corrected Formula
    const distractionManagementScore = productiveHours > 0 ? Math.max(0, (1 - timeLost / productiveHours)) * 10 : 0;
    const efficiencyScore = 
      (productivityRate / 10) * 0.4 + 
      (taskCompletionRate / 10) * 0.4 +
      distractionManagementScore * 0.2;

    setResults({
      productivityRate,
      taskCompletionRate,
      efficiencyScore,
      timeLost,
      valueLost,
      taskEfficiency,
    });
  }, [inputs]);

  const improvementScenarios: ImprovementScenario[] = results ? [
    {
      area: 'Reduzir Distrações',
      current: `${(parseFloat(inputs.distractions) || 0).toFixed(decimals)} distrações`,
      optimized: `${((parseFloat(inputs.distractions) || 0) * 0.5).toFixed(decimals)} distrações`,
      gain: `-${((parseFloat(inputs.distractions) || 0) * 0.5).toFixed(decimals)} distrações`,
      // Corrected Formula
      addedValue: formatCurrency(
        (((parseFloat(inputs.distractions) || 0) * 0.5 * (parseFloat(inputs.recoveryTime) || 0)) / 60) * (parseFloat(inputs.valuePerHour) || 0),
        decimals
      ),
    },
    {
      area: 'Aumentar Tempo Produtivo',
      current: `${(parseFloat(inputs.productiveHours) || 0).toFixed(decimals)} horas`,
      optimized: `${((parseFloat(inputs.productiveHours) || 0) * 1.15).toFixed(decimals)} horas`,
      gain: `+${((parseFloat(inputs.productiveHours) || 0) * 0.15).toFixed(decimals)} horas`,
      addedValue: formatCurrency((parseFloat(inputs.productiveHours) || 0) * 0.15 * (parseFloat(inputs.valuePerHour) || 0), decimals),
    },
    {
      area: 'Eficiência da Tarefa',
      current: `${results.taskEfficiency.toFixed(decimals)} tarefas/hora`,
      optimized: `${(results.taskEfficiency * 1.20).toFixed(decimals)} tarefas/hora`,
      gain: `+${(results.taskEfficiency * 0.20).toFixed(decimals)} tarefas/hora`,
      // Corrected Formula
      addedValue: formatCurrency(
        (parseFloat(inputs.productiveHours) || 0) * 0.20 * (parseFloat(inputs.valuePerHour) || 0),
        decimals
      ),
    },
  ] : [];

  return (
    <>
      <div className="relative z-10 container mx-auto p-4 md:p-8 font-sans text-white pb-[50vh]">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white tracking-wide [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Análise de Produtividade</h1>
          <p className="text-lg text-slate-300 mt-2 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Insira seus dados para obter métricas detalhadas e insights.</p>
        </div>

        <main className="space-y-8">
          {/* Input Section */}
          <div className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/20">
              <div className="border-b border-white/20 pb-4 mb-6">
                  <h2 className="text-2xl font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Entradas de Tempo & Tarefa</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                  <InputGroup label="Total de Horas Disponíveis" name="totalHours" value={inputs.totalHours} onChange={handleInputChange} unit="hrs" />
                  <InputGroup label="Horas Produtivas" name="productiveHours" value={inputs.productiveHours} onChange={handleInputChange} unit="hrs" />
                  <InputGroup label="Tarefas Planejadas" name="plannedTasks" value={inputs.plannedTasks} onChange={handleInputChange} />
                  <InputGroup label="Tarefas Concluídas" name="completedTasks" value={inputs.completedTasks} onChange={handleInputChange} />
              </div>

              <div className="border-b border-white/20 pb-4 mb-6 mt-8">
                  <h2 className="text-2xl font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Métricas de Valor (Opcional)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <InputGroup label="Valor do Seu Tempo (Por Hora)" name="valuePerHour" value={inputs.valuePerHour} onChange={handleInputChange} prefix="R$" />
                  <InputGroup label="Custo Estimado Por Distração" name="estimatedCostPerDistraction" value={inputs.estimatedCostPerDistraction} onChange={handleInputChange} prefix="R$" />
                  <InputGroup label="Número de Distrações" name="distractions" value={inputs.distractions} onChange={handleInputChange} />
                  <InputGroup label="Tempo Médio de Recuperação Por Distração" name="recoveryTime" value={inputs.recoveryTime} onChange={handleInputChange} unit="mins" />
              </div>

               <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg mt-8 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Opções de Exibição</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center">
                      <div className="flex flex-col">
                          <label htmlFor="decimals" className="mb-1.5 text-sm font-medium text-slate-200 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Casas Decimais:</label>
                          <select
                              id="decimals"
                              name="decimals"
                              value={decimals}
                              onChange={(e) => setDecimals(parseInt(e.target.value))}
                              className="w-full px-3 py-2 bg-slate-800/50 text-white border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition duration-150 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"
                          >
                              <option value="0">0</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                          </select>
                      </div>
                      <div className="flex items-center mt-6">
                          <input
                              type="checkbox"
                              id="showImprovements"
                              name="showImprovements"
                              checked={showImprovements}
                              onChange={handleInputChange}
                              className="h-5 w-5 bg-white/10 border-white/30 rounded text-slate-300 focus:ring-white/50"
                          />
                          <label htmlFor="showImprovements" className="ml-2 text-sm font-medium text-slate-200 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Mostrar cenários de melhoria</label>
                      </div>
                  </div>
              </div>

              <div className="flex items-center justify-start gap-4 mt-8 pt-6 border-t border-white/20">
                  <button
                      onClick={calculateResults}
                      className="px-8 py-3 bg-white/20 text-white font-bold rounded-lg hover:bg-white/30 focus:outline-none focus:ring-4 focus:ring-white/50 transition-transform transform hover:scale-105 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"
                  >
                      Calcular
                  </button>
                  <button
                      onClick={handleReset}
                      className="px-8 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/50 transition-colors [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"
                  >
                      Redefinir
                  </button>
              </div>
          </div>

          {results && (
            <div className="space-y-8">
              {/* Results Dashboard */}
              <div className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/20">
                  <h2 className="text-2xl font-semibold text-white mb-6 pb-4 border-b border-white/20 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Resultados da Análise de Produtividade</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <ResultCard title="Taxa de Produtividade" value={`${results.productivityRate.toFixed(decimals)}%`} description="Horas Produtivas / Total de Horas" isHighlighted />
                      <ResultCard title="Taxa de Conclusão de Tarefas" value={`${results.taskCompletionRate.toFixed(decimals)}%`} description="Concluídas / Tarefas Planejadas" />
                      <ResultCard title="Pontuação de Eficiência" value={`${results.efficiencyScore.toFixed(decimals)}`} description="De 10" />
                      <ResultCard title="Tempo Perdido com Distrações" value={`${results.timeLost.toFixed(decimals)} hrs`} description="Incluindo tempo de recuperação" />
                      <ResultCard title="Valor do Tempo Perdido" value={formatCurrency(results.valueLost, decimals)} description="Baseado no valor por hora" />
                      <ResultCard title="Eficiência da Tarefa" value={`${results.taskEfficiency.toFixed(decimals)}`} description="Tarefas por hora produtiva" />
                  </div>
              </div>

              {/* Improvement Scenarios */}
              {showImprovements && (
                   <div className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/20">
                      <h2 className="text-2xl font-semibold text-white mb-6 pb-4 border-b border-white/20 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Cenários de Melhoria da Produtividade</h2>
                      <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-white/20">
                              <thead className="bg-white/10">
                                  <tr>
                                      {['Área de Melhoria', 'Atual', 'Otimizado', 'Ganho', 'Valor Adicionado'].map(header => (
                                          <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{header}</th>
                                      ))}
                                  </tr>
                              </thead>
                              <tbody className="bg-transparent divide-y divide-white/20">
                                  {improvementScenarios.map((scenario, index) => (
                                      <tr key={index} className="hover:bg-white/5 transition-colors">
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{scenario.area}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{scenario.current}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{scenario.optimized}</td>
                                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]`}>{scenario.gain}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{scenario.addedValue}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {/* Calculation Details */}
              <div className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/20">
                  <h2 className="text-2xl font-semibold text-white mb-6 pb-4 border-b border-white/20 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Detalhes do Cálculo</h2>
                  <div className="prose prose-invert max-w-none prose-h3:font-semibold prose-h3:text-white prose-strong:text-white">
                      <h3 className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Valores de Entrada:</h3>
                      <ul>
                          <li className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Total de Horas Disponíveis: {(parseFloat(inputs.totalHours) || 0).toFixed(decimals)} hrs</li>
                          <li className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Horas Produtivas: {(parseFloat(inputs.productiveHours) || 0).toFixed(decimals)} hrs</li>
                          <li className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Tarefas Planejadas: {inputs.plannedTasks}</li>
                          <li className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Tarefas Concluídas: {inputs.completedTasks}</li>
                          <li className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Valor por Hora: {formatCurrency(parseFloat(inputs.valuePerHour || '0'), decimals)}</li>
                          <li className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Custo Estimado por Distração: {formatCurrency(parseFloat(inputs.estimatedCostPerDistraction || '0'), decimals)}</li>
                          <li className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Número de Distrações: {inputs.distractions}</li>
                          <li className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Tempo Médio de Recuperação: {inputs.recoveryTime} minutos</li>
                      </ul>

                      <h3 className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Passo 1: Calcular Taxa de Produtividade</h3>
                      <p className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Taxa de Produtividade = (Horas Produtivas ÷ Total de Horas) × 100</p>
                      <p className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"><code>({(parseFloat(inputs.productiveHours) || 0).toFixed(decimals)} hrs ÷ {(parseFloat(inputs.totalHours) || 0).toFixed(decimals)} hrs) × 100 = <strong>{results.productivityRate.toFixed(decimals)}%</strong></code></p>

                      <h3 className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Passo 2: Calcular Taxa de Conclusão de Tarefas</h3>
                      <p className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Taxa de Conclusão de Tarefas = (Tarefas Concluídas ÷ Tarefas Planejadas) × 100</p>
                      <p className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"><code>({(parseFloat(inputs.completedTasks) || 0)} ÷ {(parseFloat(inputs.plannedTasks) || 0)}) × 100 = <strong>{results.taskCompletionRate.toFixed(decimals)}%</strong></code></p>
                      
                      <h3 className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Passo 3: Calcular Tempo Perdido devido a Distrações</h3>
                      <p className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Tempo de Recuperação em Horas = (Número de Distrações × Tempo Médio de Recuperação em Minutos) ÷ 60</p>
                      <p className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"><code>({(parseFloat(inputs.distractions) || 0)} × {(parseFloat(inputs.recoveryTime) || 0)}) ÷ 60 = <strong>{results.timeLost.toFixed(decimals)} hrs</strong></code></p>
                      <p className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Valor do Tempo Perdido = Tempo de Recuperação em Horas × Valor por Hora</p>
                      <p className="overflow-x-auto [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                          <code>
                          {results.timeLost.toFixed(decimals)} hrs × {formatCurrency(parseFloat(inputs.valuePerHour || '0'), decimals)} = <strong>{formatCurrency(results.valueLost, decimals)}</strong>
                          </code>
                      </p>


                      <h3 className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Passo 4: Calcular Eficiência da Tarefa</h3>
                      <p className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Eficiência da Tarefa = Tarefas Concluídas ÷ Horas Produtivas</p>
                      <p className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"><code>{(parseFloat(inputs.completedTasks) || 0)} ÷ {(parseFloat(inputs.productiveHours) || 0).toFixed(decimals)} hrs = <strong>{results.taskEfficiency.toFixed(decimals)} tarefas por hora</strong></code></p>

                      <h3 className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Passo 5: Calcular Pontuação Geral de Eficiência</h3>
                      <p className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">A Pontuação de Eficiência combina taxa de produtividade (40%), conclusão de tarefas (40%) e gerenciamento de distrações (20%), normalizada para uma pontuação de 10.</p>
                      <p className="overflow-x-auto [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"><code>({results.productivityRate.toFixed(decimals)}% ÷ 10 × 0.4) + ({results.taskCompletionRate.toFixed(decimals)}% ÷ 10 × 0.4) + (Pontuação de Distração × 0.2) = <strong>{results.efficiencyScore.toFixed(decimals)}</strong></code></p>
                  </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <footer className="w-full">
        <div className="meteor-shower">
          <div className="meteor"></div>
          <div className="meteor"></div>
          <div className="meteor"></div>
          <div className="meteor"></div>
          <div className="meteor"></div>
          <div className="meteor"></div>
          <div className="meteor"></div>
        </div>
        <div className="stars-container">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
        <div className="waves-container">
            <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 150 100" preserveAspectRatio="none" shapeRendering="auto">
                <defs>
                    <path id="gentle-wave" d="M-160 50c30 0 58-50 88-50s 58 50 88 50 58-50 88-50 58 50 88 50 v51h-352z" />
                </defs>
                <g className="parallax">
                    <use href="#gentle-wave" x="48" y="0" fill="rgba(160, 32, 240,0.1)" />
                    <use href="#gentle-wave" x="48" y="10" fill="rgba(160, 32, 240,0.2)" />
                    <use href="#gentle-wave" x="48" y="20" fill="rgba(160, 32, 240,0.3)" />
                    <use href="#gentle-wave" x="48" y="30" fill="rgba(160, 32, 240,0.4)" />
                    <use href="#gentle-wave" x="48" y="40" fill="rgba(160, 32, 240,0.5)" />
                    <use href="#gentle-wave" x="48" y="50" fill="rgba(160, 32, 240,0.6)" />
                </g>
            </svg>
        </div>
      </footer>
    </>
  );
};

export default App;
