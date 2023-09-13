import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

// const CONDENSE_PROMPT = `Given the conversation history provided below and a follow-up question, please rephrase the follow-up question to make it a standalone question.

// Conversation History:
// {chat_history}

// Follow-up Question: {question}

// Rephrased Standalone Question:`;

// const QA_PROMPT = `As an AI assistant, I am here to help you. Please use the provided context to answer the question at the end. If I don't know the answer, I will let you know. If the question is not related to the given context, I will kindly respond that I am focused on answering context-related questions.

// Context:
// {context}

// Question: {question}

// Helpful Answer (in Markdown):`;

export const makeChain = (
  vectorstore: PineconeStore,
  QA_PROMPT: any,
  CONDENSE_PROMPT: any,
) => {
  const model = new OpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: 'gpt-4', //change this to gpt-4 if you have access (gpt-3.5-turbo)
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    },
  );
  return chain;
};
