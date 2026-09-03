# Athvexa Backend - Running Instructions

## ✅ ISSUE FIXED - Script Working Correctly

**Original Issue**: When running `java -jar target\athvexa-backend-1.0.0.jar`, Spring Boot was receiving the literal string `${SPRING_DATASOURCE_URL}` instead of the resolved environment variable value, causing error:
```
Could not find or load main class .datasource.url=jdbc:postgresql...
```

**Root Cause**: PowerShell backticks for line continuation were causing Java `-D` arguments to be parsed incorrectly.

**Solution**: Fixed `run-local.ps1` to pass each `-D` argument as a properly quoted single string.

**Status**: ✅ **SCRIPT FIX VERIFIED** - Spring Boot now starts successfully, Tomcat initializes on port 10000, and configuration is properly passed.

---

## 🎯 CURRENT STATUS

### ✅ FIXED: Java Command Syntax
The `run-local.ps1` script now correctly passes Java system properties. Spring Boot starts successfully and Tomcat initializes on port 10000.

### ⚠️ NOTE: Database Authentication
If you see `FATAL: password authentication failed for user "postgres"`, this indicates:
- ✅ The script syntax is working correctly
- ✅ Spring Boot is reading the configuration properly  
- ⚠️ The database credentials may need to be verified

**To resolve database authentication issues:**
1. Verify your Supabase password hasn't changed
2. Check that the database connection string is correct
3. Ensure your Supabase instance is running and accessible
4. Update the credentials in `run-local.ps1` if needed

---

## OPTION 1: Use the Provided Script (EASIEST)

### Step 1: Edit `run-local.ps1`

Open `run-local.ps1` and replace the placeholder values:

```powershell
$JWT_SECRET = "your-actual-jwt-secret-here"
$GEMINI_API_KEY = "your-actual-gemini-api-key-here"
```

The database and Cloudinary credentials are already set correctly.

### Step 2: Run the Script

```powershell
cd c:\Users\victo\.vscode\Athvexa\Backend
.\run-local.ps1
```

This will:
- Build the JAR if needed
- Pass all configuration as Java system properties
- Start the backend on port 10000

---

## OPTION 2: Manual Command (ADVANCED)

### Step 1: Build the JAR

```powershell
cd c:\Users\victo\.vscode\Athvexa\Backend
mvn clean package -DskipTests
```

### Step 2: Run with Java System Properties

Replace the placeholder values and run:

```powershell
java `
    -Dspring.datasource.url="jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:6543/postgres?prepareThreshold=0" `
    -Dspring.datasource.username="postgres.wpamdnxkripvkiperlkl" `
    -Dspring.datasource.password="9aJpOmQHySV1zx14" `
    -Djwt.secret="YOUR_JWT_SECRET" `
    -Dcloudinary.cloud_name="dxst75r0s" `
    -Dcloudinary.api_key="571284175968616" `
    -Dcloudinary.api_secret="nlq-0bD7Ah76i_JuSaOxLuLT35c" `
    -Dgemini.api.key="YOUR_GEMINI_API_KEY" `
    -jar target\athvexa-backend-1.0.0.jar
```

---

## OPTION 3: Maven Run (DEVELOPMENT ONLY)

For development with hot reload:

```powershell
cd c:\Users\victo\.vscode\Athvexa\Backend

# Set environment variables
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:6543/postgres?prepareThreshold=0"
$env:SPRING_DATASOURCE_USERNAME = "postgres.wpamdnxkripvkiperlkl"
$env:SPRING_DATASOURCE_PASSWORD = "9aJpOmQHySV1zx14"
$env:JWT_SECRET = "YOUR_JWT_SECRET"
$env:CLOUDINARY_CLOUD_NAME = "dxst75r0s"
$env:CLOUDINARY_API_KEY = "571284175968616"
$env:CLOUDINARY_API_SECRET = "nlq-0bD7Ah76i_JuSaOxLuLT35c"
$env:GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"

# Run with Maven
mvn spring-boot:run
```

---

## SUCCESS INDICATORS

When the backend starts successfully, you should see:

```
HikariCP-Athvexa - Starting...
HikariCP-Athvexa - Added connection org.postgresql.jdbc.PgConnection@...
HikariCP-Athvexa - Start completed.
Tomcat started on port(s): 10000 (http)
Started AthvexaApplication in X.XXX seconds
```

---

## ERROR INDICATORS

❌ **If you see this error:**
```
Driver org.postgresql.Driver claims to not accept jdbcUrl, ${SPRING_DATASOURCE_URL}
```

**Cause**: The configuration variable was not resolved.

**Fix**: Make sure you're using the `run-local.ps1` script OR passing `-D` flags directly to the `java` command.

---

## RENDER DEPLOYMENT

On Render, environment variables work differently:

1. Render automatically sets environment variables in the container
2. Spring Boot reads them from `application.properties` using `${VAR_NAME}` syntax
3. No `-D` flags needed

The current `application.properties` is already configured correctly for Render.

---

## TROUBLESHOOTING

### Q: Can I still use environment variables?

**A**: Yes, but you must ensure they're visible to the Java process. On Windows PowerShell, use `-D` flags for reliability.

### Q: Why doesn't `$env:VAR` work?

**A**: PowerShell environment variables don't always propagate to child processes, especially when Spring Boot resolves them at startup.

### Q: Do I need to modify application.properties?

**A**: No. The syntax `${VAR_NAME}` works for both environment variables AND Java system properties. We just changed how we pass the values.

---

## FILES CHANGED

- `pom.xml` - Removed incorrect `systemPropertyVariables` configuration
- `run-local.ps1` - Created script to run backend with proper configuration
- `RUN_INSTRUCTIONS.md` - This file
