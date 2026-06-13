# 🔍 Painel de Busca de Diretórios Web

Um painel moderno e responsivo para escanear diretórios em sites web e verificar status HTTP.

## ✨ Recursos

- 🎯 **Scan de Diretórios**: Verifica a existência de diretórios em um site alvo
- 📋 **Wordlists Pré-configuradas**: 
  - Common (100 entradas)
  - Medium (500 entradas)
  - Large (2000 entradas)
  - Presets: WordPress, Default, API
- ⚡ **Requisições Simultâneas**: Suporte para 5-30 threads paralelas
- 📊 **Análise de Status HTTP**: Exibe 200, 301, 302, 304, 403, 404, 500, etc.
- 🎨 **Interface Responsiva**: Design moderno com gradientes e animações
- 💾 **Exportar Resultados**: Salvar resultados em CSV
- 🔎 **Filtros Avançados**: Buscar e filtrar por status ou caminho
- ⏸️ **Controle de Scan**: Parar scan em andamento

## 🚀 Como Usar

1. **Abrir o painel**: Acesse https://used01.github.io/directory-scanner/
2. **Configurar URL alvo**: Digite a URL do site a ser escaneado
3. **Selecionar wordlist**: 
   - Use uma pré-configurada ou
   - Adicione uma customizada (uma por linha) ou
   - Clique em um preset (Common, WordPress, API, etc.)
4. **Configurar threads**: Defina quantas requisições simultâneas fazer
5. **Opções avançadas**:
   - Seguir redirecionamentos (301/302)
   - Mostrar todas as respostas (inclusive 404)
6. **Iniciar scan**: Clique em "Iniciar Scan"
7. **Analisar resultados**: Veja status HTTP, tamanho e tempo de resposta
8. **Exportar**: Clique em "Exportar CSV" para salvar os resultados

## 📋 Wordlists Padrão

### Common (100 entradas)
```
admin, backup, config, data, database, upload, api, assets,
css, js, images, includes, plugins, themes, wp-admin, wp-content,
private, public, src, dist, build, docs, test, tmp, temp, ...
```

### WordPress
```
wp-admin, wp-content, wp-includes, wp-json, wp-login.php,
wp-register.php, xmlrpc.php, plugins, themes, uploads, ...
```

### API
```
api, api/v1, api/v2, rest, graphql, swagger, openapi,
docs, endpoints, status, health, auth, oauth, token, ...
```

## 🛡️ Status HTTP Suportados

| Status | Cor | Significado |
|--------|-----|-------------|
| 200 | Verde | OK - Diretório encontrado |
| 301/302 | Amarelo | Redirecionamento |
| 304 | Azul | Not Modified |
| 403 | Vermelho | Forbidden - Acesso negado |
| 404 | Cinza | Not Found - Não existe |
| 500 | Vermelho | Server Error |

## ⚙️ Configurações

- **URL Alvo**: Defina o site a ser escaneado
- **Wordlist**: Escolha entre pré-configuradas ou customizada
- **Threads**: 5, 10, 20 ou 30 requisições simultâneas
- **Seguir Redirecionamentos**: Ativa/desativa seguimento de 301/302
- **Mostrar Todas as Respostas**: Inclui ou exclui status 404

## 📈 Estatísticas em Tempo Real

O painel exibe:
- Total de URLs checadas
- Quantidade de respostas 200 OK (verde)
- Quantidade de redirecionamentos (amarelo)
- Quantidade de erros/bloqueios (vermelho)

## 🔒 Considerações de Segurança

⚠️ **AVISO**: Use esta ferramenta apenas em sites que você tem permissão para testar. Respeite as leis locais e os termos de serviço dos sites.

### Limitações CORS
O navegador tem restrições CORS (Cross-Origin Resource Sharing). Esta ferramenta:
- Usa `fetch` com modo `cors` para fazer requisições
- Pode ter limitações com sites com headers CORS rigorosos
- Alguns sites podem bloquear requisições em massa

## 📈 Performance

- **Concorrência**: Configurável de 5 a 30 threads
- **Timeout**: 5 segundos por requisição
- **Barra de Progresso**: Atualização em tempo real
- **Filtros**: Busca instantânea nos resultados

## 💾 Exportação

Clique em "Exportar CSV" para baixar resultados com:
- Caminho completo
- Status HTTP
- Tamanho de conteúdo
- Tempo de resposta

## 🎨 Design

- Gradiente roxo/azul moderno
- Animações suaves
- Responsivo para mobile
- Modo claro

## 🐛 Troubleshooting

### Problema: Nenhuma resposta sendo retornada
- Verifique se a URL está correta
- O site pode estar bloqueando requisições em massa
- Tente reduzir o número de threads

### Problema: CORS error
- Alguns sites bloqueiam requisições de diferentes origens
- O painel tenta usar modos alternativos
- Use um site de teste para validar

### Problema: Scan muito lento
- Reduza o número de threads para evitar throttling
- O site alvo pode estar limitando requisições por IP

## 📝 Licença

Aberto para uso pessoal e educacional. Use com responsabilidade.

---

**Desenvolvido com ❤️ para testes de segurança responsáveis**