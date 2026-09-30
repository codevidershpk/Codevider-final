export const TECH_STACK_CATEGORIES = [
	"ai",
	"frontend",
	"backend",
	"databases",
	"cloud_devops",
	"mobile_design",
	"apis",
] as const;

export type TechStackCategoryId = (typeof TECH_STACK_CATEGORIES)[number];

export type TechStackItem = {
	readonly name: string;
	readonly icon?: string;
	readonly iconDimensions?: {
		readonly height: number;
		readonly maxWidth: number;
	};
};

export type TechStackCategory = {
	readonly id: TechStackCategoryId;
	readonly items: readonly TechStackItem[];
};

export const TECH_STACK: readonly TechStackCategory[] = [
	{
		id: "ai",
		items: [
			{ name: "OpenAI", icon: "openai.svg" },
			{ name: "Anthropic", icon: "anthropic.svg" },
			{ name: "Gemini", icon: "gemini.svg" },
			{ name: "xAI", icon: "xai.svg" },
			{ name: "Cohere", icon: "cohere.svg" },
			{ name: "Meta AI", icon: "metaai.svg" },
			{ name: "Mistral", icon: "mistral.svg" },
			{ name: "DeepSeek", icon: "deepseek.svg" },
			{ name: "Moonshot", icon: "moonshot.svg" },
			{ name: "Qwen", icon: "qwen.svg" },
			{ name: "Z AI", icon: "zai.svg" },
			{ name: "OpenRouter", icon: "openrouter.svg" },
			{ name: "Hugging Face", icon: "huggingface.svg" },
			{ name: "AI Agents", icon: "agents.svg" },
			{ name: "MCP", icon: "mcp.svg" },
			{ name: "Ollama", icon: "ollama.svg" },
		],
	},
	{
		id: "frontend",
		items: [
			{ name: "React", icon: "react.svg" },
			{ name: "Angular", icon: "angular.svg" },
			{ name: "Vue.js", icon: "vuejs.svg" },
			{ name: "Svelte", icon: "svelte.svg" },
			{ name: "Next.js", icon: "nextjs.svg" },
			{ name: "Nuxt", icon: "nuxt.svg" },
			{ name: "Astro", icon: "astro.svg" },
			{ name: "HTML5", icon: "html.svg" },
			{ name: "CSS3", icon: "css.svg" },
			{ name: "JavaScript", icon: "javascript.svg" },
			{ name: "TypeScript", icon: "typescript.svg" },
			{ name: "Tailwind", icon: "tailwind.svg" },
			{ name: "Sass", icon: "sass.svg" },
			{ name: "jQuery", icon: "jquery.svg" },
		],
	},
	{
		id: "backend",
		items: [
			{ name: "Node.js", icon: "nodejs.svg" },
			{ name: "Express", icon: "express.svg" },
			{ name: "NestJS", icon: "nestjs.svg" },
			{ name: "Python", icon: "python.svg" },
			{ name: "Django", icon: "django.svg" },
			{ name: "Flask", icon: "flask.svg" },
			{ name: "FastAPI", icon: "fastapi.svg" },
			{ name: "PHP", icon: "php.svg" },
			{ name: "Laravel", icon: "laravel.svg" },
		],
	},
	{
		id: "databases",
		items: [
			{ name: "PostgreSQL", icon: "postgres.svg" },
			{ name: "MySQL", icon: "mysql.svg" },
			{ name: "MongoDB", icon: "mongodb.svg" },
			{ name: "Redis", icon: "redis.svg" },
			{ name: "SQL Server", icon: "sqlserver.svg" },
			{ name: "DynamoDB", icon: "dynamodb.svg" },
			{ name: "Firebase", icon: "firebase.svg" },
			{ name: "Elasticsearch", icon: "elasticsearch.svg" },
			{ name: "BigQuery", icon: "bigquery.svg" },
			{ name: "ClickHouse", icon: "clickhouse.svg" },
			{ name: "Neo4j", icon: "neo4j.svg" },
			{ name: "RabbitMQ", icon: "rabbitmq.svg" },
			{ name: "Kafka", icon: "kafka.svg" },
			{ name: "Couchbase", icon: "couchbase.svg" },
			{ name: "Chroma", icon: "chromadb.svg" },
			{ name: "Pinecone", icon: "pinecone.svg" },
			{ name: "Qdrant", icon: "qdrant.svg" },
			{ name: "Weaviate", icon: "weaviate.svg" },
		],
	},
	{
		id: "cloud_devops",
		items: [
			{ name: "AWS", icon: "aws.svg" },
			{ name: "Google Cloud", icon: "gcp.svg" },
			{ name: "Azure", icon: "azure.svg" },
			{ name: "Hetzner", icon: "hetzner.svg" },
			{ name: "OVHCloud", icon: "ovh.svg" },
			{ name: "Cloudflare", icon: "cloudflare.svg" },
			{ name: "Docker", icon: "docker.svg" },
			{ name: "Kubernetes", icon: "kubernetes.svg" },
			{ name: "Jenkins", icon: "jenkins.svg" },
			{ name: "Git", icon: "git.svg" },
			{ name: "GitHub", icon: "github.svg" },
			{ name: "GitLab", icon: "gitlab.svg" },
			{ name: "Bitbucket", icon: "bitbucket.svg" },
			{ name: "Microservices", icon: "microservices.svg" },
			{ name: "Nginx", icon: "nginx.svg" },
			{ name: "Vercel", icon: "vercel.svg" },
		],
	},

	{
		id: "mobile_design",
		items: [
			{ name: "React Native", icon: "reactnative.svg" },
			{
				name: "Figma",
				icon: "figma.svg",
				iconDimensions: { height: 40, maxWidth: 32 },
			},
			{ name: "iOS", icon: "ios.svg" },
			{
				name: "Android",
				icon: "android.svg",
				iconDimensions: { height: 30, maxWidth: 52 },
			},
		],
	},
	{
		id: "apis",
		items: [
			{ name: "REST API", icon: "rest.svg" },
			{ name: "GraphQL", icon: "graphql.svg" },
			{ name: "Socket.IO", icon: "socketio.svg" },
			{ name: "Stripe", icon: "stripe.svg" },
			{ name: "PayPal", icon: "paypal.svg" },
			{ name: "Slack", icon: "slack.svg" },
			{ name: "Jira", icon: "jira.svg" },
			{ name: "Webhooks", icon: "webhooks.svg" },
		],
	},
] as const;
export function getTechStackCategory(
	id: TechStackCategoryId,
): TechStackCategory | undefined {
	return TECH_STACK.find((category) => category.id === id);
}

export function getTechStackInitials(name: string): string {
	const words = name.split(/[\s./]+/).filter(Boolean);
	if (words.length >= 2) {
		return `${words[0][0]}${words[1][0]}`.toUpperCase();
	}

	return name.slice(0, 2).toUpperCase();
}
