# Implementation Plan

- [x] 1. Set up project structure and MCP server foundation





  - Initialize Node.js/TypeScript project with Vercel configuration
  - Install core dependencies: @modelcontextprotocol/sdk, typescript, node-fetch
  - Create directory structure: api/, src/tools/, src/services/, src/clients/, src/types/
  - Configure TypeScript with strict mode and ES2020 target
  - Create vercel.json with serverless function configuration
  - Set up environment variable schema and validation
  - _Requirements: 9.1, 9.2, 9.5_

- [x] 2. Implement shared TypeScript interfaces and types





  - Define MCP tool input/output types for all three tools
  - Create WordPress content model interfaces (WordPressPage, WordPressContent)
  - Define keyword research types (Keyword, KeywordResearchResult, ContentSegment)
  - Create content generation types (OptimizedContent, PageStructure)
  - Define error types (MCPError) with source categorization
  - _Requirements: 1.1, 2.1, 3.1, 6.1, 8.1_

- [x] 3. Build WordPress API client





- [x] 3.1 Implement WordPress REST API authentication


  - Create WordPressClient class with API key and OAuth support
  - Implement credential validation and storage
  - Add authentication headers to all requests
  - _Requirements: 1.2_

- [x] 3.2 Implement content fetching with pagination


  - Create fetchPages() method with pagination support
  - Create fetchPosts() method with pagination support
  - Implement path pattern filtering using regex
  - Parse HTML content to extract plain text using cheerio or similar
  - Handle WordPress API errors and return exact error messages
  - _Requirements: 1.1, 1.3, 1.4, 1.5_


- [x] 3.3 Add retry logic and error handling

  - Implement exponential backoff retry (3 attempts: 1s, 2s, 4s)
  - Add timeout handling (25s limit)
  - Create error response formatting
  - _Requirements: 1.3_
-

- [x] 4. Build Google Keyword Suggestion API client





- [x] 4.1 Implement Google autocomplete API integration


  - Create GoogleKeywordSuggestionClient class
  - Implement getSuggestions() method using Google autocomplete endpoint
  - Implement batchGetSuggestions() for multiple seed phrases
  - Add error handling to continue with partial data on failure
  - _Requirements: 2.1, 2.4_


- [x] 4.2 Add retry and rate limiting





  - Implement retry logic (2 attempts: 500ms, 1s delays)
  - Add client-side rate limiting
  - Implement 24-hour caching for keyword suggestions







  - _Requirements: 2.4_

- [ ] 5. Build Google Trends API client

- [x] 5.1 Implement Google Trends integration



  - Create GoogleTrendsClient class using google-trends-api package









  - Implement getTrendData() method with 12-month date range


  - Parse trend data and related queries
  - Add error handling to continue with partial data on failure
  - _Requirements: 2.2, 2.4, 2.5_



- [ ] 5.2 Add caching and optimization
  - Implement 1-hour caching for trend data
  - Add batch processing for multiple keywords
  - Handle rate limiting and proxy configuration
  - _Requirements: 2.4, 2.5_


- [ ] 6. Implement Content Analyzer service

- [ ] 6.1 Build entity extraction

  - Create ContentAnalyzer class
  - Implement extractEntities() to identify processes, materials, standards, products, specifications
  - Use regex patterns and keyword matching for entity detection
  - Normalize extracted entities (handle synonyms and variants)
  - _Requirements: 3.2, 4.2, 4.3, 4.5_

- [x] 6.2 Implement page type inference



  - Create inferPageType() method
  - Analyze categories, tags, and content structure
  - Return page type: landing, service, product, blog, or other
  - _Requirements: 1.1_

- [ ] 6.3 Add language variant detection



  - Implement detectLanguageVariants() method
  - Detect regional spelling patterns (US/UK/IN)
  - Generate spelling variants for keywords (aluminum/aluminium, AWG/mm²)
  - _Requirements: 3.2_
-

- [-] 7. Implement Segment Router service







- [ ] 7.1 Build signal detection logic
  - Create SegmentRouter class
  - Define mechanical signal patterns (CNC, milling, EDM, casting, forging, tolerances, GD&T, PPAP, FAI, CMM, SS304, 6061, flanges, ASME, ISO, IATF)
  - Define electrical signal patterns (transformers, cables, voltage, AWG, IP, NEMA, UL, IEC, RoHS, CRGO, ferrite)
  - Implement classifySegment() to detect and count signals
  - Return primary segment with confidence score
  - _Requirements: 3.1, 4.1, 4.2, 4.3_




- [ ] 7.2 Implement industry inference
  - Create inferIndustries() method
  - Define industry keyword patterns (aerospace, automotive, medical, oil and gas, energy, rail, marine, industrial automation)

  - Return 1-3 most relevant industries with confidence scores
  - _Requirements: 4.4_

- [ ] 7.3 Add material and standard extraction

  - Extract and normalize materials/alloys (SS304, 316L, 17-4PH, 6061, copper, brass, CRGO)
  - Extract and normalize standards (ISO 9001, AS9100, IATF 16949, ISO 13485, ASME B16.5, IEC 60529, UL 94, NEMA 4X, RoHS, REACH)
  - Handle standard code variations and abbreviations
  - _Requirements: 4.5_

- [ ] 8. Implement Keyword Processor service

- [ ] 8.1 Build filtering logic

  - Create KeywordProcessor class
  - Implement applyNegativeFilters() with exclusion list (job, hiring, career, salary, training, course, tutorial, DIY, repair, fix, definition, meaning, student, vs, comparison)
  - Add exception for blog page type to allow comparison keywords
  - Implement question detection and removal (how, what, why, when, where)
  - _Requirements: 7.1, 7.2, 7.5_

- [ ] 8.2 Implement deduplication logic

  - Implement stemKeyword() using Porter Stemmer algorithm
  - Create normalizeKeyword() for singular/plural normalization
  - Handle hyphenation variants (busbar/bus bar)
  - Implement synonym collapsing (socket/receptacle, cable lug/cable terminal)
  - Create deduplicate() method combining all strategies
  - _Requirements: 7.3_

- [ ] 8.3 Add word limit enforcement

  - Implement enforceWordLimit() to validate 2-6 word constraint
  - Filter out keywords outside the word limit
  - _Requirements: 3.5, 7.4_

- [ ] 9. Implement Intent Classifier service

- [ ] 9.1 Build intent classification logic

  - Create IntentClassifier class
  - Implement classifyIntent() method
  - Define navigational patterns (category/solution head terms, product+industry modifiers)
  - Define commercial patterns (manufacturer, supplier, OEM, price, quote)
  - Define informational patterns (head terms, noun phrases without questions)
  - _Requirements: 5.1_

- [ ] 9.2 Implement keyword distribution by page type

  - Create distributeKeywords() method
  - Apply page-type-specific distribution rules:
    - Service: 8 Navigational, 6 Commercial, 6 Informational
    - Product: 8 Navigational, 8 Commercial, 4 Informational
    - Landing: 10 Navigational, 4 Commercial, 6 Informational
    - Blog: 6 Navigational, 2 Commercial, 12 Informational
    - Other: 10 Navigational, 4 Commercial, 6 Informational
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [ ] 10. Implement primary keyword selection logic

  - Create selectPrimaryKeyword() function
  - Extract 2-6 word, non-branded, buyer-leaning keyword from title
  - Apply page-type-specific formatting:
    - Service: process + material or standard
    - Product: product + specification or rating
    - Landing: category + vertical
    - Blog: topical head term without questions
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_


- [ ] 11. Implement keyword clustering logic
  - Create clusterKeywords() function
  - Detect trigger conditions (≥3 subcategories OR landing/service with broad scope)
  - Group keywords into 6-10 thematic clusters
  - Assign descriptive labels to clusters
  - Select 3-5 representative keywords per cluster
  - Build clusters across categories: Services, Products, Materials, Standards/Compliance, Specs/Protection, Industries, Problems/Use Cases
  - Format output as: "Cluster Label: keyword1; keyword2; keyword3"
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 12. Implement extract_wordpress_content MCP tool

  - Create tool handler function in src/tools/extract-wordpress.ts
  - Define MCP tool schema with input validation
  - Integrate WordPressClient to fetch content
  - Filter pages by path pattern (default: /cnc-services/*)
  - Use ContentAnalyzer to infer page types
  - Format response according to WordPressContent interface
  - Handle errors and return exact WordPress API error messages
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_


- [ ] 13. Implement research_keywords MCP tool
- [ ] 13.1 Create tool handler and orchestration
  - Create tool handler function in src/tools/research-keywords.ts
  - Define MCP tool schema with input validation
  - Orchestrate the keyword research pipeline
  - _Requirements: 2.1, 2.2, 2.3_


- [ ] 13.2 Integrate content analysis and keyword generation
  - Use SegmentRouter to classify content segment
  - Use ContentAnalyzer to extract entities
  - Generate seed phrases from title and content
  - Query GoogleKeywordSuggestionClient with seed phrases
  - Query GoogleTrendsClient for trend data
  - Aggregate results from both APIs
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 13.3 Apply filtering and classification

  - Use KeywordProcessor to filter and deduplicate keywords
  - Use selectPrimaryKeyword() to identify primary keyword
  - Use IntentClassifier to categorize keywords by intent
  - Apply page-type-specific distribution
  - Conditionally apply clusterKeywords() if triggered
  - Format response according to KeywordResearchResult interface
  - _Requirements: 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 10.1, 10.2, 10.3, 10.4, 10.5_


- [ ] 14. Implement generate_optimized_content MCP tool
- [ ] 14.1 Create tool handler and content structure

  - Create tool handler function in src/tools/generate-content.ts
  - Define MCP tool schema with input validation
  - Parse source content and page structure
  - _Requirements: 8.3_

- [ ] 14.2 Implement content generation logic

  - Generate content sections based on page structure
  - Use simple Indian English vocabulary
  - Write in active voice with short sentences
  - Integrate primary and secondary keywords naturally
  - Create conversion-focused CTAs
  - Structure content with clear headings and bullet points
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 14.3 Add content quality metrics

  - Calculate word count per section
  - Calculate keyword density for primary and secondary keywords
  - Calculate readability score (Flesch-Kincaid)
  - Format response according to OptimizedContent interface
  - _Requirements: 8.1, 8.2, 8.5_


- [ ] 15. Implement MCP server entry point
- [ ] 15.1 Create main server file
  - Create api/mcp.ts as Vercel serverless function entry point
  - Initialize MCP server using @modelcontextprotocol/sdk
  - Validate environment variables on startup
  - Register all three MCP tools with schemas
  - _Requirements: 9.1, 9.2, 9.5_


- [ ] 15.2 Implement request routing
  - Create handleRequest() to route MCP requests to tool handlers
  - Implement MCP protocol request/response formatting
  - Add global error handling and logging
  - Ensure responses are MCP-compliant
  - Handle function timeout limits (30s)
  - _Requirements: 9.2, 9.3, 9.4_


- [ ] 16. Add configuration and environment setup
  - Create .env.example with all required and optional variables
  - Document environment variables: WORDPRESS_API_KEY, WORDPRESS_SITE_URL, GOOGLE_TRENDS_PROXY, LOG_LEVEL, MAX_PAGES_PER_REQUEST
  - Create README.md with setup instructions
  - Add Vercel deployment instructions
  - _Requirements: 9.5_


- [ ] 17. Implement security measures
  - Add input sanitization for all tool inputs
  - Validate URLs to prevent SSRF attacks
  - Implement content size limits (max 100KB per page)
  - Strip malicious HTML from WordPress content
  - Ensure API keys are never logged or exposed
  - _Requirements: 1.2, 9.5_

- [ ] 18. Add caching layer

  - Implement in-memory cache for WordPress content (5 minutes TTL)
  - Implement cache for Google Trends data (1 hour TTL)
  - Implement cache for keyword suggestions (24 hours TTL)
  - Add cache hit/miss logging
  - _Requirements: 2.4, 2.5_


- [ ] 19. Add monitoring and logging
  - Implement structured logging with log levels
  - Log all API errors with full context
  - Log performance metrics for slow requests (>10s)
  - Track request count by tool
  - Track error rate by source
  - _Requirements: 9.3_


- [ ] 20. Create integration tests
  - Test extract_wordpress_content with mock WordPress API
  - Test research_keywords with sample content
  - Test generate_optimized_content with keyword set
  - Test error handling for API failures
  - Test partial failure scenarios (one API fails)
  - _Requirements: 1.3, 2.4_
