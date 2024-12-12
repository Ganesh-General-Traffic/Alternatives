from db import get_connection

def run_query(query):
    # Connection parameters
    # server = SERVER
    # database = DB
    # username = UN
    # password = PW
    # driver = DRIVER

    # # Establish a connection to the database
    # connection = pyodbc.connect(
    #     f'DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}'
    # )
    connection = get_connection()
    
    try:
        cursor = connection.cursor()
        # Execute the query
        cursor.execute(query)
        
        # Fetch all results and store them in an array
        # results = [row for row in cursor.fetchall()]
        # print(results)
        results = cursor.fetchall()
        # print(results)  # Print the fetched results directly
    finally:
        # Ensure the connection is closed after execution
        cursor.close()
        connection.close()

    return results

def getDBResults(QUERY_PART):
    try:
        QUERY_PART = QUERY_PART.strip()
        
        query = f"""
        
        
        WITH MAIN_CTE AS (
            SELECT Part, AlternatePart, IsPurchaseAlt
            FROM dbo.Alternatives
            WHERE Part = '{QUERY_PART}'
        ),
        
        SUB_CTE AS (
            SELECT Part, AlternatePart, IsPurchaseAlt 
            FROM dbo.Alternatives
            WHERE Part IN (
                SELECT AlternatePart
                FROM MAIN_CTE
        ))
        
        select Part,AlternatePart,IsPurchaseAlt from dbo.Alternatives where part = '{QUERY_PART}'
        
        union all
        
        select Part,AlternatePart,IsPurchaseAlt from SUB_CTE;
        
        """
        # print("QUERY_PART:", QUERY_PART)
        # print("Query being run:", query)
        results_array = run_query(query.strip())

        return results_array
    except Exception as e:
        
        print("GET didnt work!")

def run_delete_query(query):
    # Connection parameters
    # server = SERVER
    # database = DB
    # username = UN
    # password = PW
    # driver = DRIVER

    # Establish a connection to the database
    connection = get_connection()
    
    try:
        cursor = connection.cursor()
        # Execute the DELETE query
        cursor.execute(query)
        
        # Commit the transaction
        connection.commit()
        
        print("Delete query executed successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Ensure the connection is closed after execution
        cursor.close()
        connection.close()

def run_insert_query(docstring):
    # Connection parameters
    # server = SERVER
    # database = DB
    # username = UN
    # password = PW
    # driver = DRIVER

    # Establish a connection to the database
    connection = get_connection()
    
    try:
        cursor = connection.cursor()
        # Execute the INSERT query
        cursor.execute(docstring)
        connection.commit()  # Commit the transaction
        print("Insert query executed successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        cursor.close()  # Close the cursor
        connection.close()  # Close the connection

def pushToDBPandasApply(cols):
    try:
        og_gt_part = cols[0] # This is the existing clusters part
        new_part = cols[1]
        
        res = getDBResults(og_gt_part)
        unique_parts = [og_gt_part] + [part for part in set(row[0] for row in res) if part != og_gt_part]
        # print(unique_parts)
    
        docstring = []
        docstring.append("INSERT INTO dbo.Alternatives (Part, AlternatePart, IsPurchaseAlt)")
        docstring.append(" VALUES ")
        
        for part in unique_parts:
            if part == og_gt_part:
                docstring.append(f"('{part}', '{new_part}', 1),")
                docstring.append(f"('{new_part}', '{part}', 1),")
            else:
                filtered_query_res = [tup for tup in res if tup[0] == og_gt_part and tup[1] == part][0][2]
                if filtered_query_res:
                    docstring.append(f"('{part}', '{new_part}', 1),")
                    docstring.append(f"('{new_part}', '{part}', 1),")
                else:
                    docstring.append(f"('{part}', '{new_part}', 0),")
                    docstring.append(f"('{new_part}', '{part}', 0),")
        
        # Join all the lines into a single docstring
        docstring_output = "".join(docstring).rstrip(",")  # Remove the trailing comma
        # print("\n")
        # print(docstring_output)
        # print("\n\n\n\n")
        
        run_insert_query(docstring_output)
    #     print(f"PART : {og_gt_part}, NEW : {new_part} - QUERY SUCCESFUL")
    except:
        raise Exception
        print(f"PART : {og_gt_part}, NEW : {new_part} - ****** ERROR ******")
    


def removePartFromAlternatives(part:str):
    queryString = f"DELETE from dbo.Alternatives WHERE Part = '{part}' or AlternatePart = '{part}'"
    run_delete_query(queryString)
