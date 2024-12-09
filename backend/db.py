import pyodbc

def get_connection():
    """
    Establishes a connection to the SQL Server database.
    """
    try:
        connection = pyodbc.connect(
            "DRIVER={ODBC Driver 17 for SQL Server};"  # Make sure the driver is installed
            "SERVER=192.168.0.142;"  # Replace with your server name
            "DATABASE=Autopart;"  # Replace with your database name
            "UID=gtbl_dataserver;"  # Replace with your username
            "PWD=;"  # Replace with your password
        )
        print("Database connection successful!")
        return connection
    except pyodbc.Error as e:
        print(f"Error connecting to SQL Server: {e}")
        return None

def close_connection(connection):
    """
    Closes the given SQL Server database connection.
    """
    if connection:
        connection.close()
        print("Database connection closed.")

def checkIfInProductTable(part):
    print("Tyring Connection")
    connection = get_connection()

    # Use the connection for database operations
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute(f"""
            SELECT CASE 
            WHEN EXISTS (
               SELECT 1
               FROM dbo.Product
               WHERE KeyCode = '{part}'
           )
           THEN CAST(1 AS BIT) -- TRUE
           ELSE CAST(0 AS BIT) -- FALSE
                END AS IsPresent;""")  # Replace with your query
            present_or_not = cursor.fetchall()[0][0]
            return present_or_not
        except Exception as e:
            print(f"Error executing query: {e}")
        finally:
            # Close the connection
            close_connection(connection)



def getNAlternatives(part):
    print("Tyring Connection")
    connection = get_connection()

    # Use the connection for database operations
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute(f"""select count(AlternatePart) as alt_count from dbo.Alternatives where Part = '{part}';""")  # Replace with your query
            n_alts = cursor.fetchall()[0][0]
            return n_alts
        except Exception as e:
            print(f"Error executing query: {e}")
        finally:
            # Close the connection
            close_connection(connection)
