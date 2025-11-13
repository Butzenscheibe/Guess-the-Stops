import re
import sqlite3
path = './database/timetable-gen'
ger_path = './database/german-db'
rand_route_sql = "select route_id from routes where route_desc in (select Abbr from transport_modes where Ref = 'Z' and Abbr not in ('TER','TGV','EXT','ZUG')) order by random() limit 1;"
rand_train_sql = "select trip_id, route_id from trips where route_id = ? order by random() limit 1;"
class Database:
    def __init__(self, db_file):
        self.conn = sqlite3.connect(db_file)
        self.c = self.conn.cursor()
class Train:
    def __init__(self, train_id, route_id, train_name, stops):
        self.route_id = route_id
        self.train_id = train_id
        self.train_name = train_name
        self.stops = stops
class GameTrain:
    def __init__(self, train_id, route_id, train_name, stops):
        self.train_id = train_id
        self.route_id = route_id
        self.train_name = train_name
        self.stops = stops
        self.guessed_stops = self.create_guessed_stops()
        self.edit_stop()
    def create_guessed_stops(self):
        guessed_stops = []
        for stop in self.stops:
            stop_placeholder = "X" * len(stop)
            guessed_stops.append(stop_placeholder)
        guessed_stops[0] = self.stops[0]
        guessed_stops[-1] = self.stops[-1]
        return guessed_stops
    def edit_stop(self):
            stops_temp = []
            for stop in self.stops:
                print(stop)
                stop = stop.replace(',', ' ')
                stop = re.sub('Gl\.\d+ .*', ' ', stop)
                stop = re.sub('-?>.*', ' ', stop)
                stop = re.sub('[a-zA-Z]{3}stieg', ' ', stop)
                stop = re.sub('Bstggl\.[0-9]', ' ', stop)
                stop = re.sub('([MU]\d+\+*)+', ' ', stop)
                stop = re.sub('\(.*\)', ' ', stop)
                stop = re.sub(' +', ' ', stop)
                print(stop)
                stops_temp.append(stop)
            self.stops = stops_temp
def build_query(difficulty):
    if difficulty == 'easy':
        return "select route_id from routes where route_desc = 'IC' and agency_id = 11 order by random() limit 1;"
    elif difficulty == 'medium':
        return "select route_id from routes where route_desc in (select Abbr from transport_modes where Ref = 'Z' and Abbr not in ('TER','TGV','EXT','ZUG')) order by random() limit 1;"
    elif difficulty == 'hard':
        return "select route_id from routes where route_desc in (select Abbr from transport_modes where Ref = 'Z' and Abbr not in ('TER','TGV','EXT','ZUG')) order by random() limit 1;"
def build_query_germany(difficulty):
    if difficulty == 'easy':
        return "select trip_id, route_id from trips where route_id in (select route_id from routes where route_type = 2 and agency_id = 27) order by random() limit 1;"
    elif difficulty == 'medium':
        return "select trip_id, route_id from trips where route_id in (select route_id from routes where route_type = 2 and agency_id not in (148, 100, 122, 161, 79, 9, 302, 320)) order by random() limit 1;"
    elif difficulty == 'hard':
        return "select trip_id, route_id from trips where route_id in (select route_id from routes where agency_id in (209, 320) ) order by random() limit 1;"
def select_rand_train(db: Database, query, country = 'ch'):
    if country == 'de':
        cur = db.c
        return cur.execute(query).fetchone()[0:2]
    cur = db.c
    id = cur.execute(query).fetchone()[0]
    cur.execute(rand_train_sql, (id,))
    return cur.fetchone()[0:2]
def select_all_stops(train_id, db: Database):
    cur = db.c
    cur.execute("select stop_id from stop_times where trip_id = ?", (train_id,))
    stop_ids = cur.fetchall()
    stops = []
    for stop_id in stop_ids:
        cur.execute("select stop_name from stops where stop_id = ?", (stop_id[0],))
        stop = cur.fetchone()[0]
        stops.append(stop)
    return stops
def get_train_name(route_id, db: Database):
    cur = db.c
    cur.execute("select route_short_name, route_desc from routes where route_id = ?", (route_id,))
    return cur.fetchone()
def get_train_name_db(route_id, db: Database):
    cur = db.c
    cur.execute("select route_short_name from routes where route_id = ?", (route_id,))
    return cur.fetchone()
def start_game():
    intro()
    train = prepare_game()
    announce_train(train)
    game_loop(train)
def create_game_train(train):
    game_train = GameTrain(train.train_id, train.route_id, train.train_name, train.stops)
    return game_train
def choose_game_mode():
    print("Choose the game mode:")
    print("1. Easy")
    print("2. Medium")
    print("3. Hard")
    mode = input("Enter the number of the game mode: ")
    if mode == '1':
        return 'easy'
    elif mode == '2':
        return 'medium'
    elif mode == '3':
        return 'hard'
    else:
        print("Invalid input. Try again!")
        return choose_game_mode()
def choose_country():
    print("Choose the country:")
    print("1. Switzerland")
    print("2. Germany")
    country = input("Enter the number of the country: ")
    if country == '1':
        return 'ch'
    elif country == '2':
        return 'de'
    else:
        print("Invalid input. Try again!")
        return choose_country()
def prepare_game(retry = False):
    if not(retry):
        country, db, query = game_selection()
    train_id, route_id = select_rand_train(db, query, country) 
    stops = select_all_stops(train_id, db)
    if len(stops) <= 2:
        db.conn.close()
        return prepare_game(True)
    if country == 'ch':
        route_name, route_desc = get_train_name(route_id, db)
        train_name = f'{route_name} ({route_desc})'
    else:
        train_name = get_train_name_db(route_id, db)[0]
    train = Train(train_id, route_id, train_name, stops)
    db.conn.close()
    return create_game_train(train)

def game_selection():
    country = choose_country()
    if country == 'ch':
        db = Database(path)
    else:
        db = Database(ger_path)
    difficulty = choose_game_mode()
    if country == 'ch':
        query = build_query(difficulty)
    else:
        query = build_query_germany(difficulty)
    return country,db,query
def intro():
    print("Welcome to the Train Timetable Game!")
    print("You will be given a random train route and you have to guess the stops in the correct order.")
    print("Let's start the game!")
def announce_train(train):
    print(f'Your train is: {train.train_name}')
    print(f'The first stop is: {train.stops[0]} and the last stop is: {train.stops[-1]}')
def game_loop(train):
    exit = False
    while not exit:
        print(train.guessed_stops)
        guess = input("Enter the next stop: ")
        #guess = guess.upper()
        #guess = guess.removeprefix('S ')
        #guess = guess.replace(' ', '')
        if guess == 'exit':
            print("The train stops were: ", train.stops)
            exit = True
        elif guess in train.stops:
            if guess in train.guessed_stops:
                print("You have already guessed this stop. Try again!")
                continue
            index = train.stops.index(guess)
            train.guessed_stops[index] = guess
            print("Correct!")
            exit = end_game(train)
        else:
            print("Incorrect. Try again!")
def end_game(train):
    if train.stops == train.guessed_stops:
        print("Congratulations! You have guessed all the stops correctly.")
        return True
    return False
if __name__ == '__main__':
    start_game()
