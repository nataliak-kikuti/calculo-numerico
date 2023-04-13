// Aqui é onde o usuario vai digitar a função poliminomial.
type FormType = {
  funcpolinomial: string; // tipo String vai aceitar valores como por exemplo "3^3+2*5-2".
};

// Atributos para mostrar os dados do calculo da função digitada pelo usuario.
type DataSourceType = {
  key: number;
  func: string;
  xValue: number;
  fxValue: number;
  sinal: "+" | "-";
};

// Definição de regra do intervalo.
type Interval = {
  key: number;
  a: DataSourceType;
  b: DataSourceType;
  label: string;
};

// Definição da quantidade de iterações que o programa vai fazer se baseando no calculo da função.
type IteracaoK = {
  key: number;
  label: string;
  k: Interval;
};

//
type AppState = {
  funcpolinomial: string;
  xValueInitial: number;
  dataSource: DataSourceType[];
  intervals: Interval[];
  selectedInterval: Interval | undefined;
  iteracaoK: IteracaoK[];
  epsilon: number | undefined;
  loadingGeneretInterval: boolean;
  loadingEpsilon: boolean;
};