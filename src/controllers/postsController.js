// Importa as funções necessárias para manipular posts do banco de dados
import {getTodosPosts , criarPost, atualizarPost} from "../models/postsModel.js";
// Importa o módulo do sistema de arquivos para manipular arquivos
import fs from "fs";
import gerarDescricaoComGemini from "../services/geminiService.js"

// Define uma função assíncrona para listar todos os posts
export async function listarPosts(req, res)  {
    // Obtém todos os posts do banco de dados
    const posts = await getTodosPosts();
    // Envia uma resposta HTTP com status 200 e os posts no formato JSON
    res.status(200).json(posts);
}

// Define uma função assíncrona para criar um novo post
export async function postarNovoPost(req, res) {
    // Obtém os dados do novo post do corpo da requisição
    const novoPost = req.body;
    // Tenta criar o novo post no banco de dados
    try {
        // Chama a função criarPost para inserir o post
        const postCriado = await criarPost(novoPost)
        // Envia uma resposta HTTP com status 200 e o post criado
        res.status(200).json(postCriado);
    } catch(erro){
        // Registra o erro no console e envia uma resposta de erro
        console.error(erro.message);
        res.status(500).json({"Erro":"Falha na requisição"})
    }
}

// Define uma função assíncrona para fazer o upload de uma imagem e criar um novo post
export async function uploadImagem(req, res) {
    // Cria um objeto com os dados do novo post, incluindo o nome original da imagem
    const novoPost = {
        descricao: "",
        imgUrl: req.file.originalname,
        alt:""
    };
    // Tenta criar o novo post e renomear a imagem
    try {
        // Chama a função criarPost para inserir o post
        const postCriado = await criarPost(novoPost)
        // Gera o novo nome da imagem com base no ID do post
        const imagemAtualizada = `uploads/${postCriado.insertedId}.png`
        // Renomeia o arquivo da imagem e move-o para a pasta de uploads
        fs.renameSync(req.file.path, imagemAtualizada)
        // Envia uma resposta HTTP com status 200 e o post criado
        res.status(200).json(postCriado);
    } catch(erro){
        // Registra o erro no console e envia uma resposta de erro
        console.error(erro.message);
        res.status(500).json({"Erro":"Falha na requisição"})
    }
}

export async function atualizarNovoPost(req, res) {
    const id = req.params.id;
    const urlImagem = `http://localhost:3000/${id}.png`
    try {
        const imageBuffer = fs.readFileSync(`uploads/${id}.png`)
        const descricao = await gerarDescricaoComGemini(imageBuffer)
        const post = {
            imgUrl: urlImagem, 
            descricao: descricao,
            alt: req.body.alt
        }
        const postCriado = await atualizarPost(id, post)
        res.status(200).json(postCriado);
    } catch(erro){
        console.error(erro.message);
        res.status(500).json({"Erro":"Falha na requisição"})
    }
}
