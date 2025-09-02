# RAGNA Studio - RAG Server

A high-performance Retrieval-Augmented Generation (RAG) server built with TypeScript, Express.js, and modern vector databases. This server provides APIs for document parsing, embedding, and semantic search capabilities.

## 🚀 Features

- **Document Processing**: Parse various document formats using Apache Tika
- **Text Embedding**: Support for multiple embedding providers (OpenAI, Cohere)
- **Vector Storage**: Qdrant integration for efficient vector storage and retrieval
- **Semantic Search**: Fast similarity search across embedded documents
- **Text Tokenization**: Built-in tokenization with tiktoken
- **Docker Support**: Complete Docker Compose setup for easy deployment
- **TypeScript**: Full type safety and modern development experience

## 📋 API Endpoints

The server exposes the following REST API endpoints under `/api/v1`:

- **`/parse`** - Document parsing and text extraction
- **`/embed`** - Document embedding and vector storage
- **`/search`** - Semantic search across embedded documents
- **`/tokenize`** - Text tokenization services

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Vector Database**: Qdrant
- **Document Processing**: Apache Tika
- **Embedding Providers**: OpenAI, Cohere
- **Validation**: Zod schemas
- **Logging**: Consola
- **Containerization**: Docker & Docker Compose

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 22+
- Docker and Docker Compose
- Environment variables configured (see [Configuration](#configuration))

### Development Setup

1. **Clone the repository**

    ```bash
    git clone https://github.com/hopkins385/rag-server-ts.git
    cd rag-server-ts
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Configure environment**

    ```bash
    cp .env.example .env
    # Edit .env with your configuration
    ```

4. **Start development server**
    ```bash
    npm run dev
    ```

### Docker Deployment

1. **Start the complete stack**

    ```bash
    docker-compose up -d
    ```

    This will start:

    - RAG Server (API)
    - Qdrant (Vector Database)
    - Apache Tika (Document Processing)

2. **For development with hot reload**
    ```bash
    docker-compose -f docker-compose.dev.yml up -d
    ```

## 📖 API Documentation

### Document Embedding

```bash
POST /api/v1/embed/file
Content-Type: application/json

{
  "mediaId": "unique-media-id",
  "recordId": "unique-record-id",
  "mimeType": "application/pdf",
  "filePath": "/path/to/document.pdf"
}
```

### Semantic Search

```bash
POST /api/v1/search/vector
Content-Type: application/json

{
  "query": "your search query",
  "recordIds": ["record-id-1", "record-id-2"]
}
```

### Text Tokenization

```bash
POST /api/v1/tokenize/text
Content-Type: application/json

{
  "text": "text to tokenize"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Update documentation as needed
- Run linting and type checking before committing
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [Qdrant](https://github.com/qdrant/qdrant) - Vector similarity search engine
- [Apache Tika](https://tika.apache.org/) - Content analysis toolkit
- [OpenAI](https://openai.com/) - AI platform for embeddings
- [Cohere](https://cohere.ai/) - Natural language AI platform

## 📞 Support

If you have any questions or run into issues, please:

1. Check the [Issues](https://github.com/hopkins385/rag-server-ts/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

Built with ❤️ and Appreciation by [Sven Stadhouders](https://github.com/hopkins385)
