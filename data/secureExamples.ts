import { SecureExample } from '../types';

export const secureExamples: SecureExample[] = [
  {
    id: 'js-xss',
    language: 'JavaScript',
    category: 'Input Validation',
    title: 'Preventing XSS in React',
    description: 'Cross-Site Scripting (XSS) occurs when an application includes untrusted data in a web page. In React, data binding is secure by default, but using `dangerouslySetInnerHTML` can create vulnerabilities.',
    code: `// UNSAFE PATTERN
// const userContent = "<img src=x onerror=alert(1)>";
// <div dangerouslySetInnerHTML={{ __html: userContent }} />

// SECURE PATTERN
// React automatically escapes content in JSX
const userContent = "<img src=x onerror=alert(1)>";

function UserComment({ content }) {
  return (
    <div className="comment-body">
      {content} 
    </div>
  );
}`
  },
  {
    id: 'js-sql',
    language: 'JavaScript',
    category: 'Database Security',
    title: 'Preventing SQL Injection (Node.js)',
    description: 'SQL Injection allows attackers to interfere with database queries. Always use parameterized queries instead of string concatenation.',
    code: `// UNSAFE PATTERN
// const query = "SELECT * FROM users WHERE id = " + req.params.id;
// db.query(query);

// SECURE PATTERN (using pg library)
const query = "SELECT * FROM users WHERE id = $1";
const values = [req.params.id];

await db.query(query, values);`
  },
  {
    id: 'py-deserialization',
    language: 'Python',
    category: 'Input Validation',
    title: 'Safe Deserialization',
    description: 'Pickle is insecure when loading untrusted data. Use formats like JSON for data exchange.',
    code: `# UNSAFE PATTERN
# import pickle
# data = pickle.loads(untrusted_data)

# SECURE PATTERN
import json

try:
    data = json.loads(untrusted_data)
except json.JSONDecodeError:
    print("Invalid data format")`
  },
  {
    id: 'java-xxe',
    language: 'Java',
    category: 'XML Security',
    title: 'Preventing XXE Injection',
    description: 'XML External Entity (XXE) attacks occur when XML input containing a reference to an external entity is processed by a weakly configured XML parser.',
    code: `// SECURE PATTERN
DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();

// Disable DTDs (Doctypes)
dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);

// Disable External Entities
dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);

// Disable external DTDs
dbf.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);

dbf.setXIncludeAware(false);
dbf.setExpandEntityReferences(false);`
  },
  {
    id: 'cpp-buffer',
    language: 'C++',
    category: 'Memory Safety',
    title: 'Preventing Buffer Overflows',
    description: 'Buffer overflows happen when data is written past the end of a buffer. Use safe standard library strings and vectors instead of raw arrays and pointer arithmetic.',
    code: `// UNSAFE PATTERN
// char buffer[10];
// strcpy(buffer, large_input); 

// SECURE PATTERN
#include <string>
#include <iostream>

void processInput(const std::string& input) {
    // std::string handles memory management automatically
    std::string safeBuffer = input;
    std::cout << "Processed: " << safeBuffer << std::endl;
}`
  },
  {
    id: 'sol-reentrancy',
    language: 'Solidity',
    category: 'Smart Contract Security',
    title: 'Preventing Reentrancy Attacks',
    description: 'Reentrancy occurs when external contract calls are allowed to make new calls to the calling contract before the initial execution is complete. Use the Checks-Effects-Interactions pattern.',
    code: `// SECURE PATTERN
mapping(address => uint) private userBalances;
bool private locked;

modifier noReentrant() {
    require(!locked, "No re-entrancy");
    locked = true;
    _;
    locked = false;
}

function withdrawBalance() public noReentrant {
    uint amountToWithdraw = userBalances[msg.sender];
    
    // Checks
    require(amountToWithdraw > 0);
    
    // Effects
    userBalances[msg.sender] = 0;
    
    // Interactions
    (bool success, ) = msg.sender.call{value: amountToWithdraw}("");
    require(success, "Transfer failed");
}`
  },
  {
    id: 'py-secrets',
    language: 'Python',
    category: 'Cryptography',
    title: 'Secure Random Number Generation',
    description: 'Standard random modules are predictable. Use the secrets module for security-sensitive operations.',
    code: `# UNSAFE PATTERN
# import random
# token = random.randint(0, 100000)

# SECURE PATTERN
import secrets

# Generate a secure URL-safe text string
reset_token = secrets.token_urlsafe(32)

# Generate a secure integer
secure_int = secrets.randbelow(100000)`
  },
  {
    id: 'rb-cmd',
    language: 'Ruby',
    category: 'Command Injection',
    title: 'Preventing Command Injection',
    description: 'Avoid using `exec` or backticks with user input. Use `system` with separate arguments.',
    code: `# UNSAFE PATTERN
# filename = params[:filename]
# \`cat #{filename}\`

# SECURE PATTERN
filename = params[:filename]

# Passing arguments as a list prevents shell interpretation
if File.exists?(filename)
  system("cat", filename) 
end`
  },
  {
    id: 'go-sql',
    language: 'Go',
    category: 'Database Security',
    title: 'Preventing SQL Injection (Go)',
    description: 'Use placeholders (?) or numbered arguments ($1) depending on the driver to prevent injection.',
    code: `// UNSAFE PATTERN
// query := fmt.Sprintf("SELECT * FROM users WHERE name = '%s'", name)
// db.Query(query)

// SECURE PATTERN
stmt, err := db.Prepare("SELECT * FROM users WHERE name = ?")
if err != nil {
    log.Fatal(err)
}
defer stmt.Close()

rows, err := stmt.Query(userInputName)`
  }
];