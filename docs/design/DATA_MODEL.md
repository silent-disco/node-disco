SET{id}               rooms

STRING                room:{id}
HASH{id -> member}    room:{id}:members

LIST{id}              room:{id}:playlist:order
HASH{id -> song}      room:{id}:playlist