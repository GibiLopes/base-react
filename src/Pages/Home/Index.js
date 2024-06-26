/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './style.css';
import Swal from 'sweetalert2';
import axios from '../../services/axios';
import history from '../../services/history'
import Loading from '../../components/Loading/index';
import Grafico from '../../components/Grafico';
import * as actionsAuth from '../../store/modules/auth/actions'
import DespesasFixasHome from '../../components/despesasFixasHome';
import GraficoCategoriaDespesa from '../../components/GraficoCategoriaDespesa';
import GraficoCategoriaReceita from '../../components/GraficoCategoriaReceita';
import Footer from '../../components/Footer/index';



export default function Home() {
  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState(false);
  const [saldo, setSaldo] = useState('');
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [transacoes, setTransacoes] = useState([]);
  const [totalDespesas, setTotalDespesas] = useState(0)
  const [verGrafReceita, setVerGrafReceita] = useState('')
  const [verGrafDespesa, setVerGrafDespesa] = useState('');
  const [verBalanMensal, setVerBalanMensal] = useState('');
  const [verTotalDespesas, setVerTotalDespesas] = useState('');
  const [verTotalReceitas, setVerTotalRecetas] = useState('');
  const [verSaldo, setVerSaldo] = useState('');
  const user = useSelector((state) => state.auth.user);

  const formatarValor = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  const formatarData = new Intl.DateTimeFormat('pt-BR', {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric'
  })

  const mes = new Date().getMonth() + 1
  const ano = new Date().getFullYear()

  // Dados da API
  if (user) {
    try {
      useEffect(() => {
        async function getData() {
          setIsLoading(true)
          const responseConta = await axios.get(`/contas/index/${user.id}`).catch((err) => {
            if (err.response.status === 401) {
              dispatch(actionsAuth.loginFailure()); // Dispatch login failure action
              history.go('/login'); // Redirect to login page
              Swal.fire({
                icon: 'error',
                title: 'Sessão expirada!',
                text: 'Seu login expirou, faça login novamente para acessar sua conta.'
              });
            }
          })
          if (responseConta.data.length > 0) {
            setSaldo(responseConta.data[0].saldo);
            const responseTransacoes = await axios.get(`/transacoes/all/${responseConta.data[0].id}`)

            if (responseTransacoes.data <= 0) {
              setTotalDespesas(0);
              setTotalReceitas(0);
            } else {
              setTransacoes(responseTransacoes.data)
              if (responseTransacoes.data.filter((transacao) => transacao.tipo === 'Receita') <= 0) {
                setTotalReceitas(0)
              } else {
                // eslint-disable-next-line no-return-assign, no-param-reassign
                setTotalReceitas(responseTransacoes.data.filter((transacao) => transacao.tipo === 'Receita' && new Date(transacao.data).getMonth() + 1 === mes && new Date(transacao.data)).filter((transacao) => new Date(transacao.data).getFullYear() === ano).map((transacao) => parseFloat(transacao.valor)).reduce((acumulador, valores) => acumulador += valores))
              }
              if (responseTransacoes.data.filter((transacao) => transacao.tipo === 'Despesa') <= 0) {
                setTotalDespesas(0);
              } else {
                // eslint-disable-next-line no-return-assign, no-param-reassign
                setTotalDespesas(responseTransacoes.data.filter((transacao) => transacao.tipo === 'Despesa' && new Date(transacao.data).getMonth() + 1 === mes && new Date(transacao.data)).filter((transacao) => new Date(transacao.data).getFullYear() === ano).map((transacao) => parseFloat(transacao.valor)).reduce((acumulador, valores) => acumulador += valores))
              }
            }

          } else {
            setSaldo(0);
            setTotalReceitas(0);
            setTotalDespesas(0);
          }
          const responseConfig = await axios.get(`/user-config/${user.id}`)
          setVerGrafReceita(responseConfig.data[0].verGrafReceita);
          setVerGrafDespesa(responseConfig.data[0].verGrafDespesa);
          setVerBalanMensal(responseConfig.data[0].verBalanMensal);
          setVerTotalDespesas(responseConfig.data[0].verTotalDespesas);
          setVerTotalRecetas(responseConfig.data[0].verTotalReceitas);
          setVerSaldo(responseConfig.data[0].verSaldo);

          setIsLoading(false)
        }

        getData()
      }, [])
    } catch (error) {
      Swal.fire(({
        title: 'error',
        icon: 'error',
        text: `${error.response.data}`
      }))
    }
  }

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {isLoading ? (
        <Loading isLoading={isLoading} />
      ) : (
        <div className="pages_content">
          <h1 className='title'>DASHBOARD</h1>

          <div className='grid'>

            {verSaldo ? (
              <div className='col'>
                <div className='box info-home info-saldo'>
                  <p className='p'>Saldo: <br />
                    <p className='label'>
                      {formatarValor.format(saldo)}
                    </p>
                  </p>
                  <i className='bx bxs-bank' />
                  <div className='detalhes'>
                    <div className='box'>
                      {transacoes.filter((transacao) => new Date(transacao.data).getMonth() + 1 === mes && new Date(transacao.data).getFullYear() === ano).length > 0 ? (
                        <table className='table is-hoverable is-fullwidth'>
                          <thead>
                            <tr>
                              <td>Descricao:</td>
                              <td>Data:</td>
                              <td>Valor:</td>
                              <td />
                            </tr>
                          </thead>
                          <tbody>
                            {transacoes.slice(0, 5).filter((transacao) => new Date(transacao.data).getMonth() + 1 === mes && new Date(transacao.data).getFullYear() === ano).map((transacao) => (
                              <tr>
                                <td>{transacao.descricao}</td>
                                <td>{formatarData.format(new Date(transacao.data))}</td>
                                <td>{formatarValor.format(transacao.valor)}</td>
                                <td>{transacao.tipo === 'Receita' ? (<i className='bx bxs-up-arrow' />) : (<i className='bx bxs-down-arrow' />)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        "Não há movimentações no mês para exibir"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : ""}


            {verTotalReceitas ? (
              <div className='col'>
                <div className='box info-home info-receitas'>
                  <p className='p'>Receitas: <br />
                    <p className='label'>
                      {formatarValor.format(totalReceitas)}
                    </p>
                  </p>
                  <i className='bx bxs-up-arrow-circle' />
                  <div className='detalhes'>
                    <div className='box'>
                      {transacoes.filter((transacao) => transacao.tipo === 'Receita' && new Date(transacao.data).getMonth() + 1 === mes && new Date(transacao.data).getFullYear() === ano).length > 0 ? (
                        <table className='table is-hoverable is-fullwidth'>
                          <thead>
                            <tr>
                              <td>Descricao:</td>
                              <td>Data:</td>
                              <td>Valor:</td>
                              <td />
                            </tr>
                          </thead>
                          <tbody>
                            {transacoes.filter((transacao) => transacao.tipo === 'Receita' && new Date(transacao.data).getMonth() + 1 === mes && new Date(transacao.data)).filter((transacao) => new Date(transacao.data).getFullYear() === ano).slice(0, 3).map((transacao) => (
                              <tr>
                                <td>{transacao.descricao}</td>
                                <td>{formatarData.format(new Date(transacao.data))}</td>
                                <td>{formatarValor.format(transacao.valor)}</td>
                                <td>{transacao.tipo === 'Receita' ? (<i className='bx bxs-up-arrow' />) : (<i className='bx bxs-down-arrow' />)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                      ) : (
                        "Ainda não há receitas nesse mês"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : ""}

            {verTotalDespesas ? (
              <div className='col'>
                <div className='box info-home info-despesas'>
                  <p className='p'>Despesas: <br />
                    <p className='label'>
                      {formatarValor.format(totalDespesas)}
                    </p>
                  </p>
                  <i className='bx bxs-down-arrow-circle' />
                  <div className='detalhes'>
                    <div className='box'>
                      {transacoes.filter((transacao) => transacao.tipo === 'Despesa' && new Date(transacao.data).getMonth() + 1 === mes && new Date(transacao.data).getFullYear() === ano).length > 0 ? (
                        <table className='table is-hoverable is-fullwidth'>
                          <thead>
                            <tr>
                              <td>Descricao:</td>
                              <td>Data:</td>
                              <td>Valor:</td>
                              <td />
                            </tr>
                          </thead>
                          <tbody>
                            {transacoes.filter((transacao) => transacao.tipo === 'Despesa' && new Date(transacao.data).getMonth() + 1 === mes && new Date(transacao.data)).filter((transacao) => new Date(transacao.data).getFullYear() === ano).slice(0, 3).map((transacao) => (
                              <tr>
                                <td>{transacao.descricao}</td>
                                <td>{formatarData.format(new Date(transacao.data))}</td>
                                <td>{formatarValor.format(transacao.valor)}</td>
                                <td>{transacao.tipo === 'Receita' ? (<i className='bx bxs-up-arrow' />) : (<i className='bx bxs-down-arrow' />)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        "Ainda não há despesas nesse mês"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : ""}
          </div>

          <div className="grid">
            {verGrafDespesa ? (
              <div className="col">
                <div className='box'>
                  <GraficoCategoriaDespesa />
                </div>
              </div>
            ) : ""}

            {verGrafReceita ? (
              <div className='col'>
                <div className='box'>
                  <GraficoCategoriaReceita />
                </div>
              </div>
            ) : (
              ""
            )}
          </div>


          <div className="grid">
            {verBalanMensal ? (
              <div className="col">
                <Grafico />
              </div>
            ) : ""}

            <div className='col'>
              <DespesasFixasHome />
            </div>
          </div>
          <Footer />
        </div >

      )
      }
    </>
  );
}
