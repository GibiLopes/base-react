/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

import './style.css';
import axios from '../../services/axios';
import history from '../../services/history';
import Loading from "../../components/Loading";
import Footer from '../../components/Footer';
import GraficoCategoriaDespesa from '../../components/GraficoCategoriaDespesa/index';
import Grafico from '../../components/Grafico/index';

export default function Extratos() {
  const user = useSelector(state => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);
  const [conta, setConta] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [transacoesBase, setTransacoesBase] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [minPagina, setMinPagina] = useState(0);
  const [maxPagina, setMaxPagina] = useState(10);
  const [qtdePagina, setQtdePagina] = useState(1)
  const [verPorPagina, setVerPorPagina] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtroSelecionado, setFiltroSelecionado] = useState('');
  const [mes, setMes] = useState(new Date().getUTCMonth() + 1);
  const [filtroTipo, setFiltroTipo] = useState('');
  const ano = new Date().getUTCFullYear();



  const formatarData = new Intl.DateTimeFormat('pt-BR', {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric'
  })

  function mesAtual() {
    switch (mes) {
      case 1: {
        return "Janeiro"
      }

      case 2: {
        return "Feveiro"
      }

      case 3: {
        return "Março"
      }

      case 4: {
        return "Abril"
      }

      case 5: {
        return "Maio"
      }

      case 6: {
        return "Junho"
      }

      case 7: {
        return "Julho"
      }

      case 8: {
        return "Agosto"
      }

      case 9: {
        return "Setembro"
      }

      case 10: {
        return "Outubro"
      }

      case 11: {
        return "Novembro"
      }

      case 12: {
        return "Dezembro"
      }

      default: {
        return mes
      }
    }
  }

  // pegar dados de categorias
  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true)
        const response = await axios.get('/categorias/');
        setCategorias(response.data);
        setIsLoading(false)
      } catch (error) {
        setCategorias([]);
      }
    }
    getData()
  }, [])

  // pegar dados de conta bancária
  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true);
        const response = await axios.get(`/contas/index/${user.id}`);
        setConta(response.data[0]);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setConta([]);
      }

    }
    getData()
  }, [])

  // pegar dados de transacoes
  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true)
        const response = await axios.get(`/transacoes/all/${conta.id}`);
        setTransacoesBase(response.data.filter(transacao => new Date(transacao.data).getUTCMonth() + 1 === mes && new Date(transacao.data).getUTCFullYear() === ano));
        setTransacoes(response.data.filter(transacao => new Date(transacao.data).getUTCMonth() + 1 === mes && new Date(transacao.data).getUTCFullYear() === ano));
        setQtdePagina(Math.ceil(transacoes.length / verPorPagina))
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        setTransacoes([]);
      }
    }
    getData();
  }, [conta, mes, verPorPagina, qtdePagina])

  // filtrar transacoes
  useEffect(() => {
    async function getData() {
      try {
        const response = await axios.get(`/transacoes/find/${conta.id}/${descricao}`)
        setTransacoes(response.data)
        setFiltroSelecionado(descricao);
      } catch (error) {
        setTransacoes(transacoesBase);
      }
    }
    getData();
  }, [conta, mes, verPorPagina, qtdePagina, descricao])

  function setMesAnterior() {
    if (mes <= 1) return
    setMes(mes - 1)
  }

  function setMesAcima() {
    if (mes >= 12) return
    setMes(mes + 1);
  }

  async function handleDelete(id) {
    Swal.fire({
      icon: 'warning',
      title: 'Você tem certeza?',
      text: 'Você não poderá voltar atrás!',
      showCancelButton: true,
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true)
          await axios.delete(`/transacoes/deletar/${id}/${conta.id}`)
          setIsLoading(false)
          Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: 'A transação foi excluída com sucesso! O saldo já foi atualizado.'
          })
          history.go('/')
        } catch (error) {
          setIsLoading(false);
          Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: error.response.data.errors,
          })
        }
      }
    })
  }

  const formatarValor = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })



  function handleChangeTipo(e) {
    setFiltroTipo(e.target.value);
    e.target.addEventListener("input", handleChangeTipo);
    if (filtroTipo === "Receitas") {
      setTransacoes(transacoesBase.filter(transacao => transacao.tipo === 'Receita'))
    } else if (filtroTipo === "Despesas") {
      setTransacoes(transacoesBase.filter(transacao => transacao.tipo === 'Despesa'))
    } else if (filtroTipo === "Todas") {
      setTransacoes(transacoesBase);
    }
    e.target.addEventListener("input", handleChangeTipo);
  }

  function cancelarFiltro() {
    setTransacoes(transacoesBase);
    setFiltroSelecionado('');
    setDescricao('');
    setMes(new Date().getUTCMonth() + 1);
  }

  function handleProximaPagina() {
    if (paginaAtual >= qtdePagina) return
    setMinPagina(minPagina + verPorPagina);
    setMaxPagina(maxPagina + verPorPagina);
    setPaginaAtual(paginaAtual + 1);
  }

  function handlePaginaAnterior() {
    if (paginaAtual <= 1) return
    setMinPagina(minPagina - verPorPagina);
    setMaxPagina(maxPagina - verPorPagina);
    setPaginaAtual(paginaAtual - 1);
  }

  function handleVerPorPagina(e) {
    setVerPorPagina(e.target.value);
    setMaxPagina(e.target.value);
  }

  return (
    <div className="pages_content page_extrato">
      {isLoading ? (
        <Loading isLoading={isLoading} />
      ) : (
        <>
          <h1 className="title">Extrato de transações</h1>
          <hr />
          <div className="grid">
            <div className="col">
              <br />
              {transacoes.length > 0 ? (
                <div className="grid">
                  <div className="col">
                    <center>
                      <Grafico mes={mes} transacoes={transacoes} />
                    </center>
                  </div>
                </div>
              ) : (
                <div className="box">
                  <hr />
                  <center><p>Não há movimentações nesse perído.</p></center>
                </div>
              )}
            </div>

            <div className="col">
              <div className="box">
                <center><p>Mês de {mesAtual()} - <strong>Despesas</strong></p></center>
                {transacoes.length > 0 ? (
                  <center>
                    <GraficoCategoriaDespesa mes={mes} transacoes={transacoes} categorias={categorias} />
                  </center>
                ) : (
                  <>
                    <hr />
                    <center><p>Não há movimentações nesse perído.</p></center>
                  </>
                )}
              </div>
            </div>

          </div>

          <div className="grid">
            <div className="col">
              <div className="box">

                <div className="grid">
                  <div className="col div_pesquisa">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <p className="control has-icons-left">
                        <input type="text" className="input descricao" name="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Filtre pela descrição" />
                        <span className="icon is-large is-left"><i className="bx bx-filter" /></span>
                      </p>
                      <button type="submit" className="button"><i className="bx bx-search-alt" /></button>
                    </form>
                    <br />
                    {filtroSelecionado.length > 0 ? (
                      < p className="tag is-large is-info">{filtroSelecionado}<button type="button" className="delete is-small" onClick={cancelarFiltro} /> </p>
                    ) : ""}
                  </div>

                  <div className="col">
                    <center>
                      <button type="button" className="button btnMudarMes" onClick={setMesAnterior}><i className="bx bx-arrow-back" /></button>
                      <p className="tag is-large is-info">
                        <i className="bx bx-calendar" /> {mesAtual()}
                      </p>
                      <button type="button" className="button btnMudarMes" onClick={setMesAcima}><i className="bx bx-right-arrow-alt" /></button>
                    </center>
                  </div>

                  <div className="col">
                    <p>Quantidade por página:
                      <br />
                      <div className="select">
                        <select className="input" value={verPorPagina} onChange={handleVerPorPagina}>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={30}>30</option>
                        </select>
                      </div>
                    </p>
                  </div>
                </div>

                <div className="grid">
                  <div className="col">
                    <label className="label">
                      Filtrar por tipo:
                      <br />
                      <div className="select">
                        <select className="input filter-tipo" value={filtroTipo} onClick={handleChangeTipo} onChange={handleChangeTipo}>

                          <option value="Todas">Todas</option>
                          <option value="Receitas">Receitas</option>
                          <option value="Despesas">Despesas</option>
                        </select>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid">
            <div className="col">
              <div className="box">
                {transacoes.length > 0 ? (
                  <table className="table is-hoverable is-fullwidth">
                    <thead>
                      <th />
                      <th>Descrição</th>
                      <th>Categoria</th>
                      <th>Valor</th>
                      <th>Data</th>
                      <th>Opções</th>
                    </thead>

                    <tbody>
                      {transacoes.slice(minPagina, maxPagina).map((transacao) => (
                        <tr>
                          <td>{transacao.tipo === "Receita" ? (
                            <i className='bx bxs-up-arrow' />
                          ) : <i className='bx bxs-down-arrow' />}</td>
                          <td>{transacao.descricao}</td>
                          <td>{categorias.length > 0 ? (
                            <i className={categorias.filter(categoria => categoria.id === parseFloat(transacao.categoria_id))[0].icone} />
                          ) : ""}
                            {categorias.filter(categoria => categoria.id === parseFloat(transacao.categoria_id))[0].nome}
                          </td>
                          <td><strong>{formatarValor.format(transacao.valor)}</strong></td>
                          <td>{formatarData.format(new Date(`${new Date(transacao.data).getUTCFullYear()}-${new Date(transacao.data).getUTCMonth() + 1}-${new Date(transacao.data).getUTCDate()}`))}</td>
                          <td>
                            <button type="button" className="button" onClick={() => handleDelete(transacao.id)}><i className="bx bxs-trash" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <>
                    <hr />
                    <center><p>Não há movimentações nesse período.</p></center>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid">
            <div className="col">
              {transacoes.length > 0 ? (
                <div className="botoes_mudar_pagina">
                  <button type="button" className="button" onClick={handlePaginaAnterior}><i className='bx bx-left-arrow-alt' /></button>
                  <p className="tag is-large">Página: {paginaAtual} de {Math.ceil(transacoes.length / verPorPagina)}</p>
                  <button type="button" className="button" onClick={handleProximaPagina}><i className='bx bx-right-arrow-alt' /></button>
                </div>
              ) : ""}
            </div>

          </div>
        </>
      )
      }
      <Footer />
    </div >
  )
}
