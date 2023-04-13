import "./App.css";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Table,
  message,
  Tabs,
  Select,
  Space,
} from "antd";
import { useState } from "react";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

function App() {
  const [form] = Form.useForm<FormType>();
  const [formInterval] = Form.useForm<FormType>();
  const [messageApi, contextHolder] = message.useMessage();
  const [state, setState] = useState<AppState>({
    funcpolinomial: "",
    xValueInitial: 1000,
    dataSource: [],
    intervals: [],
    iteracaoK: [],
    selectedInterval: undefined,
    epsilon: undefined,
    loadingGeneretInterval: false,
    loadingEpsilon: false,
  });

  const dataSourceAux: DataSourceType[] = [];
  const intervalsAux: Interval[] = [];
  const kAux: IteracaoK[] = [];

  function evaluatePolynomial(polynomial: string, x: number): number {
    polynomial = polynomial.replaceAll("x", "(x)");
    polynomial = polynomial.replaceAll("^", "**");
    const fn = eval(`(x) => ${polynomial}`);
    const result = fn(x);
    return result;
  }

  const handleClickGerarIntervalos = () => {
    let value = form.getFieldValue("funcpolinomial");
    value = value.replaceAll(" ", "");
    value = value.replaceAll("X", "x");
    setState((prev) => ({
      ...prev,
      funcpolinomial: value,
      loadingGeneretInterval: true,
    }));

    for (
      let index = state.xValueInitial * -1;
      index <= state.xValueInitial;
      index++
    ) {
      let func = value.replaceAll("x", "(x)");
      func = func.replaceAll("x", `${index}`);
      let fx: any = 0;
      try {
        fx = evaluatePolynomial(value, index);
      } catch (error: any) {
        console.log(error.message);
        fx = error.message;
      }

      if (isNaN(fx)) {
        messageApi.open({
          type: "error",
          content: "Há um erro de sintaxe na função informada!",
          duration: 3,
          style: {
            marginTop: "5vh",
          },
        });
        break;
      }

      const data: DataSourceType = {
        key: index,
        func,
        xValue: index,
        fxValue: fx,
        sinal: fx >= 0 ? "+" : "-",
      };
      dataSourceAux.push(data);

      if (dataSourceAux.length > 1) {
        const sinal01 = dataSourceAux[dataSourceAux.length - 1].sinal;
        const sinal02 = dataSourceAux[dataSourceAux.length - 2].sinal;

        if (sinal01 !== sinal02) {
          const a = dataSourceAux[dataSourceAux.length - 2];
          const b = dataSourceAux[dataSourceAux.length - 1];
          intervalsAux.push({
            key: index,
            a,
            b,
            label: `[${a.xValue}, ${b.xValue}]`,
          });
        }
      }
    }

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        dataSource: dataSourceAux,
        intervals: intervalsAux,
        loadingGeneretInterval: false,
      }));
    }, 3000);
  };

  const handleClickLimpar = () => {
    form.resetFields();
    formInterval.resetFields();
    setState({
      funcpolinomial: "",
      xValueInitial: 1000,
      dataSource: [],
      intervals: [],
      iteracaoK: [],
      selectedInterval: undefined,
      epsilon: undefined,
      loadingGeneretInterval: false,
      loadingEpsilon: false,
    });
  };

  const handleClickExemplo = () => {
    form.setFieldsValue({ funcpolinomial: "x^3 - 9*x + 3" });
  };

  const handleClickCalcularEpsilon = () => {
    debugger;
    let value = formInterval.getFieldValue("epsilon");
    value = value.replace(",", ".");

    if (isNaN(value)) {
      messageApi.open({
        type: "error",
        content: "Insira um valor válido para critério de parada!",
        duration: 3,
        style: {
          marginTop: "5vh",
        },
      });
      return;
    }
    if (Number(value) === 0) {
      messageApi.open({
        type: "error",
        content:
          "O valor para o critério de parada deve ser diferente de zero!",
        duration: 3,
        style: {
          marginTop: "5vh",
        },
      });
      return;
    }
    setState((prev) => ({
      ...prev,
      epsilon: value,
      loadingEpsilon: true,
    }));

    const { selectedInterval, funcpolinomial } = state;
    let fxAux = 1000;
    let count = 1;
    const a = selectedInterval?.a as DataSourceType;
    const b = selectedInterval?.b as DataSourceType;
    let aValue = a.xValue;
    let bValue = b.xValue;
    let aFxValue = a.fxValue;
    let bFxValue = b.fxValue;
    let aFunc = a.func;
    let bFunc = b.func;

    while (Math.abs(fxAux) >= Number(value)) {
      const kValue = (aValue + bValue) / 2;

      fxAux = evaluatePolynomial(funcpolinomial, kValue);

      let func = funcpolinomial.replaceAll("x", "(x)");
      func = func.replaceAll("x", `${kValue}`);

      const replaceA = fxAux > 0 === aFxValue > 0;
      if (replaceA) {
        aValue = kValue;
        aFxValue = fxAux;
        aFunc = func;
      } else {
        bValue = kValue;
        bFxValue = fxAux;
        bFunc = func;
      }

      kAux.push({
        key: kValue,
        label: `k${count}`,
        k: replaceA
          ? {
            key: kValue,
            a: {
              key: kValue,
              func,
              fxValue: fxAux,
              xValue: kValue,
              sinal: fxAux >= 0 ? "+" : "-",
            },
            b: {
              key: kValue,
              func: bFunc,
              fxValue: bFxValue,
              xValue: bValue,
              sinal: bFxValue >= 0 ? "+" : "-",
            },
            label: "",
          }
          : {
            key: kValue,
            a: {
              key: kValue,
              func: aFunc,
              fxValue: aFxValue,
              xValue: aValue,
              sinal: aFxValue >= 0 ? "+" : "-",
            },
            b: {
              key: kValue,
              func,
              fxValue: fxAux,
              xValue: kValue,
              sinal: fxAux >= 0 ? "+" : "-",
            },
            label: "",
          },
      });
      count++;
    }
    kAux.unshift({
      key: 0,
      label: "k0",
      k: {
        key: 0,
        a: selectedInterval?.a as DataSourceType,
        b: selectedInterval?.b as DataSourceType,
        label: "",
      },
    });

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        iteracaoK: kAux,
        epsilon: value,
        loadingEpsilon: false,
      }));
    }, 3000);
  };

  const findFx = (value: number): number => {
    return (
      state.iteracaoK.find((x) => x.k.a.xValue === value)?.k.a.fxValue ??
      (state.iteracaoK.find((x) => x.k.b.xValue === value)?.k.b
        .fxValue as number)
    );
  };
  return (
    <Card
      size="small"
      title={<h2 style={{
        color: "white"
      }}>{"Calculadora de raizes da função"}</h2>}
      style={{
        fontFamily: "Poppins",
        height: "100%",
        width: "800px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        boxShadow: "rgba(0, 0, 0, 0.4) 0px 30px 90px",
        border: "none"
      }}
    >
      {contextHolder}
      <Form
        {...layout}
        form={form}
        style={{ maxWidth: 600 }}
        onFinish={handleClickGerarIntervalos}
      >
        <Form.Item style={{
          fontWeight: "500",
          color: "white"
        }}
          label="f(x)"
          name="funcpolinomial"
          rules={[
            {
              required: true,
              message: "Necessário informar uma função polinomial!",
            },
          ]}
        >
          <Input style={{
            border: "none"
          }}
            type="text" placeholder="x^3 - 9*x + 3" />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Space wrap>
            <Button
              type="primary"
              style={{
                fontFamily: "Poppins",
                fontWeight: "500",
                backgroundColor: "#F08223",
                boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                border: "none"
              }}
              htmlType="submit"
              loading={state.loadingGeneretInterval}
            >
              {"Gerar intervalos"}
            </Button>
            <Button style={{
              fontWeight: "500",
              color: "orange",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
              border: "none"
            }}
              htmlType="button" onClick={handleClickLimpar}>
              {"Limpar"}
            </Button>
            <Button style={{
              color: "orange",
              fontWeight: "500",
              backgroundColor: "white",
              border: "1px solid white",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
              type="link" htmlType="button" onClick={handleClickExemplo}>
              {"Exemplo"}
            </Button>{" "}
          </Space>
        </Form.Item>
      </Form>
      <Form
        {...layout}
        form={formInterval}
        style={{ maxWidth: 600 }}
        onFinish={handleClickCalcularEpsilon}
      >
        <Form.Item 
          labelCol={{ span: 15 }}
          wrapperCol={{ span: 4 }}
          label="Selecione o intervalo:"
          name="intervalselected"
          style={{
            fontWeight: "500",
            display: "inline-block",
            width: "calc(65% - 8px)",
          }}
          rules={[
            {
              required: true,
              message: "Informe um intervalo!",
            },
          ]}
        >
          <Select
            style={{
              width: "85",
              backgroundColor: "white",
              borderRadius: "7px"
            }}
            value={state.selectedInterval ? state.selectedInterval.label : null}
            disabled={!(state.intervals.length > 0)}
            options={state.intervals.map((x) => {
              return {
                value: x.label,
                label: x.label,
              };
            })}
            onChange={(value: string) => {
              const optionSelected = state.intervals.find(
                (x) => x.label === value
              );
              setState((prev) => ({
                ...prev,
                selectedInterval: optionSelected,
              }));
            }}
          />
        </Form.Item>
        <Form.Item
          label="Epsilon"
          name="epsilon"
          style={{
            display: "inline-block",
            width: "calc(35% - 8px)",
            fontWeight: "500"
          }}
          rules={[
            {
              required: true,
              message: "Informe um critério de parada!",
            },
          ]}
        >
          <Input style={{
            backgroundColor: "white"
          }} disabled={!(state.intervals.length > 0)} />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 7 }}>
          <Button style={{
            fontFamily: "Poppins",
            fontWeight: "500",
            backgroundColor: "#F08223",
            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            border: "none"
          }}
            type="primary"
            htmlType="submit"
            loading={state.loadingEpsilon}
          >
            {"Calcular"}
          </Button>
        </Form.Item>
      </Form>

      <Card
        size="small"
        title={
          state.iteracaoK.length > 0 ? (
            <span>{`f(x) = ${state.funcpolinomial} |  f(p) ≈ 0 = ${state.iteracaoK[state.iteracaoK.length - 1].key
              }`}</span>
          ) : state.funcpolinomial.length > 0 ? (
            <span>{`f(x) = ${state.funcpolinomial}`}</span>
          ) : (
            ""
          )
        }
      >
        <Tabs
          style={{
            height: "510px",
          }}
          defaultActiveKey={"1"}
          type="card"
          size="small"
          items={[
            {
              key: "1",
              label: "Teorema de Bolzano",
              children: (
                <Table 
                  size="small"
                  loading={state.loadingGeneretInterval}
                  dataSource={state.dataSource}
                  rowKey={(record) => record.key}
                  columns={[
                    {
                      title: "x",
                      dataIndex: "xValue",
                      key: "xValue",
                    },
                    {
                      title: "Função",
                      dataIndex: "func",
                      key: "func",
                    },
                    {
                      title: "f(x)",
                      dataIndex: "fxValue",
                      key: "fxValue",
                    },
                    {
                      title: "+/-",
                      dataIndex: "sinal",
                      key: "sinal",
                    },
                  ]}
                  pagination={{
                    size: "small",
                    showSizeChanger: false,
                    showQuickJumper: false,
                    position: ["bottomCenter"],
                  }}
                  style={{
                    height: "450px",
                  }}
                />
              ),
            },
            {
              key: "2",
              label: "Método da Bissecção",
              disabled: !(state.iteracaoK.length > 0),
              children: (
                <Table
                  size="small"
                  loading={state.loadingEpsilon}
                  dataSource={state.iteracaoK}
                  rowKey={(record) => record.key}
                  columns={[
                    {
                      title: "k'",
                      dataIndex: "label",
                      key: "label",
                      render: (label) => {
                        if (
                          state.iteracaoK[state.iteracaoK.length - 1].label ===
                          label
                        ) {
                          return <span>{""}</span>;
                        }
                        return <span>{label}</span>;
                      },
                    },
                    {
                      title: "[a; b]",
                      dataIndex: "k",
                      key: "ab",
                      render: (record) => {
                        if (
                          state.iteracaoK[state.iteracaoK.length - 1].key ===
                          record.key
                        ) {
                          return <span>{""}</span>;
                        }
                        return (
                          <span>{`[${record.a.xValue ?? ""}; ${record.b.xValue ?? ""
                            }]`}</span>
                        );
                      },
                    },
                    {
                      title: "(a + b)/2",
                      dataIndex: "k",
                      key: "mid",
                      render: (record) => {
                        if (
                          state.iteracaoK[state.iteracaoK.length - 1].key ===
                          record.key
                        ) {
                          return <span>{""}</span>;
                        }
                        return (
                          <span>
                            {(record.a.xValue + record.b.xValue) / 2 ?? ""}
                          </span>
                        );
                      },
                    },
                    {
                      title: "fx((a + b)/2)",
                      dataIndex: "k",
                      key: "b",
                      render: (record) => {
                        const value = (record.a.xValue + record.b.xValue) / 2;
                        const fx = findFx(value);
                        return <span>{fx}</span>;
                      },
                    },
                    {
                      title: "+/-",
                      dataIndex: "k",
                      key: "sinal",
                      render: (record) => {
                        if (
                          state.iteracaoK[state.iteracaoK.length - 1].key ===
                          record.key
                        ) {
                          return <span>{""}</span>;
                        }
                        const fx = findFx(
                          (record.a.xValue + record.b.xValue) / 2
                        );
                        const retorno = fx >= 0 ? "+" : "-";
                        return <span>{retorno}</span>;
                      },
                    },
                  ]}
                  pagination={{
                    size: "small",
                    showSizeChanger: false,
                    showQuickJumper: false,
                    position: ["bottomCenter"],
                  }}
                  style={{
                    height: "450px",
                  }}
                />
              ),
            },
          ]}
        />
      </Card>
    </Card >
  );
}

export default App;
