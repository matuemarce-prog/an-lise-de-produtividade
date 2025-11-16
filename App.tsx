
import React, { useState, useCallback } from 'react';
import { InputData, CalculationResults, ImprovementScenario } from './types';
import { InputGroup } from './components/InputGroup';
import { ResultCard } from './components/ResultCard';

const initialInputData: InputData = {
  totalHours: '10',
  productiveHours: '5',
  plannedTasks: '10',
  completedTasks: '5',
  valuePerHour: '100',
  estimatedCostPerDistraction: '50',
  distractions: '10',
  recoveryTime: '5',
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
    const estimatedCostPerDistraction = parseFloat(inputs.estimatedCostPerDistraction) || 0;
    const distractions = parseFloat(inputs.distractions) || 0;
    const recoveryTime = parseFloat(inputs.recoveryTime) || 0;

    if (totalHours <= 0) {
      setResults(null);
      return;
    }
    
    // Core Calculations
    const productivityRate = (productiveHours / totalHours) * 100;
    const taskCompletionRate = (plannedTasks > 0 ? (completedTasks / plannedTasks) : 0) * 100;
    const timeLost = (distractions * recoveryTime) / 60;
    const valueLost = (timeLost * valuePerHour) + (distractions * estimatedCostPerDistraction);
    const taskEfficiency = productiveHours > 0 ? completedTasks / productiveHours : 0;
    
    // Efficiency Score Calculation (weighted average, normalized to 10)
    const TARGET_EFFICIENCY_FOR_SCORE = 1.25; // An assumption for scaling task efficiency to a 1-10 score
    const normalizedTaskEfficiencyScore = Math.min(taskEfficiency / TARGET_EFFICIENCY_FOR_SCORE, 1) * 10;
    const efficiencyScore = 
      (productivityRate / 10) * 0.4 + 
      (taskCompletionRate / 10) * 0.4 +
      normalizedTaskEfficiencyScore * 0.2;

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
      addedValue: formatCurrency(
        (((parseFloat(inputs.distractions) || 0) * 0.5 * (parseFloat(inputs.recoveryTime) || 0)) / 60) * (parseFloat(inputs.valuePerHour) || 0) +
        ((parseFloat(inputs.distractions) || 0) * 0.5 * (parseFloat(inputs.estimatedCostPerDistraction) || 0)),
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
      addedValue: formatCurrency(
        ((parseFloat(inputs.productiveHours) || 0) - ((parseFloat(inputs.productiveHours) || 0) / 1.2)) * (parseFloat(inputs.valuePerHour) || 0),
        decimals
      ),
    },
  ] : [];

  return (
    <div className="container mx-auto p-4 md:p-8 font-sans text-slate-800">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900">Análise de Produtividade</h1>
        <p className="text-lg text-slate-600 mt-2">Insira seus dados para obter métricas detalhadas e insights.</p>
      </header>

      <main className="space-y-8">
        {/* Input Section */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200">
            <div className="border-b border-slate-200 pb-4 mb-6">
                <h2 className="text-2xl font-semibold text-indigo-600">Entradas de Tempo & Tarefa</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                <InputGroup label="Total de Horas Disponíveis" name="totalHours" value={inputs.totalHours} onChange={handleInputChange} unit="hrs" />
                <InputGroup label="Horas Produtivas" name="productiveHours" value={inputs.productiveHours} onChange={handleInputChange} unit="hrs" />
                <InputGroup label="Tarefas Planejadas" name="plannedTasks" value={inputs.plannedTasks} onChange={handleInputChange} />
                <InputGroup label="Tarefas Concluídas" name="completedTasks" value={inputs.completedTasks} onChange={handleInputChange} />
            </div>

            <div className="border-b border-slate-200 pb-4 mb-6 mt-8">
                <h2 className="text-2xl font-semibold text-indigo-600">Métricas de Valor (Opcional)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InputGroup label="Valor do Seu Tempo (Por Hora)" name="valuePerHour" value={inputs.valuePerHour} onChange={handleInputChange} prefix="R$" />
                <InputGroup label="Custo Estimado Por Distração" name="estimatedCostPerDistraction" value={inputs.estimatedCostPerDistraction} onChange={handleInputChange} prefix="R$" />
                <InputGroup label="Número de Distrações" name="distractions" value={inputs.distractions} onChange={handleInputChange} />
                <InputGroup label="Tempo Médio de Recuperação Por Distração" name="recoveryTime" value={inputs.recoveryTime} onChange={handleInputChange} unit="mins" />
            </div>

             <div className="bg-slate-100 p-6 rounded-lg mt-8 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Opções de Exibição</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center">
                    <div className="flex flex-col">
                        <label htmlFor="decimals" className="mb-1.5 text-sm font-medium text-gray-700">Casas Decimais:</label>
                        <select
                            id="decimals"
                            name="decimals"
                            value={decimals}
                            onChange={(e) => setDecimals(parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
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
                            className="h-5 w-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="showImprovements" className="ml-2 text-sm font-medium text-gray-700">Mostrar cenários de melhoria</label>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-start gap-4 mt-8 pt-6 border-t border-slate-200">
                <button
                    onClick={calculateResults}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-transform transform hover:scale-105"
                >
                    Calcular
                </button>
                <button
                    onClick={handleReset}
                    className="px-8 py-3 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-300 transition-colors"
                >
                    Redefinir
                </button>
            </div>
        </div>

        {results && (
          <div className="space-y-8">
            {/* Results Dashboard */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200">
                <h2 className="text-2xl font-semibold text-indigo-600 mb-6 pb-4 border-b border-slate-200">Resultados da Análise de Produtividade</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ResultCard title="Taxa de Produtividade" value={`${results.productivityRate.toFixed(decimals)}%`} description="Horas Produtivas / Total de Horas" isHighlighted />
                    <ResultCard title="Taxa de Conclusão de Tarefas" value={`${results.taskCompletionRate.toFixed(decimals)}%`} description="Concluídas / Tarefas Planejadas" />
                    <ResultCard title="Pontuação de Eficiência" value={`${results.efficiencyScore.toFixed(decimals)}`} description="De 10" />
                    <ResultCard title="Tempo Perdido com Distrações" value={`${results.timeLost.toFixed(decimals)} hrs`} description="Incluindo tempo de recuperação" />
                    <ResultCard title="Valor do Tempo Perdido" value={formatCurrency(results.valueLost, decimals)} description="Baseado no valor por hora e custo por distração" />
                    <ResultCard title="Eficiência da Tarefa" value={`${results.taskEfficiency.toFixed(decimals)}`} description="Tarefas por hora produtiva" />
                </div>
            </div>

            {/* Improvement Scenarios */}
            {showImprovements && (
                 <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200">
                    <h2 className="text-2xl font-semibold text-indigo-600 mb-6 pb-4 border-b border-slate-200">Cenários de Melhoria da Produtividade</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-100">
                                <tr>
                                    {['Área de Melhoria', 'Atual', 'Otimizado', 'Ganho', 'Valor Adicionado'].map(header => (
                                        <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {improvementScenarios.map((scenario, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{scenario.area}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{scenario.current}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{scenario.optimized}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${scenario.gain.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{scenario.gain}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">{scenario.addedValue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Calculation Details */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200">
                <h2 className="text-2xl font-semibold text-indigo-600 mb-6 pb-4 border-b border-slate-200">Detalhes do Cálculo</h2>
                <div className="prose prose-slate max-w-none prose-h3:font-semibold prose-h3:text-slate-800 prose-strong:text-slate-900">
                    <h3>Valores de Entrada:</h3>
                    <ul>
                        <li>Total de Horas Disponíveis: {(parseFloat(inputs.totalHours) || 0).toFixed(decimals)} hrs</li>
                        <li>Horas Produtivas: {(parseFloat(inputs.productiveHours) || 0).toFixed(decimals)} hrs</li>
                        <li>Tarefas Planejadas: {inputs.plannedTasks}</li>
                        <li>Tarefas Concluídas: {inputs.completedTasks}</li>
                        <li>Valor por Hora: {formatCurrency(parseFloat(inputs.valuePerHour || '0'), decimals)}</li>
                        <li>Custo Estimado por Distração: {formatCurrency(parseFloat(inputs.estimatedCostPerDistraction || '0'), decimals)}</li>
                        <li>Número de Distrações: {inputs.distractions}</li>
                        <li>Tempo Médio de Recuperação: {inputs.recoveryTime} minutos</li>
                    </ul>

                    <h3>Passo 1: Calcular Taxa de Produtividade</h3>
                    <p>Taxa de Produtividade = (Horas Produtivas ÷ Total de Horas) × 100</p>
                    <p><code>({(parseFloat(inputs.productiveHours) || 0).toFixed(decimals)} hrs ÷ {(parseFloat(inputs.totalHours) || 0).toFixed(decimals)} hrs) × 100 = <strong>{results.productivityRate.toFixed(decimals)}%</strong></code></p>

                    <h3>Passo 2: Calcular Taxa de Conclusão de Tarefas</h3>
                    <p>Taxa de Conclusão de Tarefas = (Tarefas Concluídas ÷ Tarefas Planejadas) × 100</p>
                    <p><code>({(parseFloat(inputs.completedTasks) || 0)} ÷ {(parseFloat(inputs.plannedTasks) || 0)}) × 100 = <strong>{results.taskCompletionRate.toFixed(decimals)}%</strong></code></p>
                    
                    <h3>Passo 3: Calcular Valor Perdido com Distrações</h3>
                    <p>O valor perdido é a soma do custo do tempo de recuperação e do custo direto estimado por distração.</p>
                    <p>Tempo de Recuperação em Horas = (Número de Distrações × Tempo Médio de Recuperação em Minutos) ÷ 60</p>
                    <p><code>({(parseFloat(inputs.distractions) || 0)} × {(parseFloat(inputs.recoveryTime) || 0)}) ÷ 60 = <strong>{results.timeLost.toFixed(decimals)} hrs</strong></code></p>
                    <p>Valor Perdido = (Tempo de Recuperação em Horas × Valor por Hora) + (Número de Distrações × Custo Estimado por Distração)</p>
                    <p className="overflow-x-auto">
                        <code>
                        (({results.timeLost.toFixed(decimals)} hrs × {formatCurrency(parseFloat(inputs.valuePerHour || '0'), decimals)}) + ({(parseFloat(inputs.distractions) || 0)} × {formatCurrency(parseFloat(inputs.estimatedCostPerDistraction || '0'), decimals)})) = <strong>{formatCurrency(results.valueLost, decimals)}</strong>
                        </code>
                    </p>


                    <h3>Passo 4: Calcular Eficiência da Tarefa</h3>
                    <p>Eficiência da Tarefa = Tarefas Concluídas ÷ Horas Produtivas</p>
                    <p><code>{(parseFloat(inputs.completedTasks) || 0)} ÷ {(parseFloat(inputs.productiveHours) || 0).toFixed(decimals)} hrs = <strong>{results.taskEfficiency.toFixed(decimals)} tarefas por hora</strong></code></p>

                    <h3>Passo 5: Calcular Pontuação Geral de Eficiência</h3>
                    <p>A Pontuação de Eficiência combina taxa de produtividade (40%), conclusão de tarefas (40%) e eficiência da tarefa (20%), normalizada para uma pontuação de 10.</p>
                    <p className="overflow-x-auto"><code>({results.productivityRate.toFixed(decimals)}% ÷ 10 × 0.4) + ({results.taskCompletionRate.toFixed(decimals)}% ÷ 10 × 0.4) + (Eficiência Normalizada × 0.2) = <strong>{results.efficiencyScore.toFixed(decimals)}</strong></code></p>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
