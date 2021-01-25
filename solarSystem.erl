-module(solarSystem).
-export([process_csv/1,is_numeric/1]).

% https://rosettacode.org/wiki/Determine_if_a_string_is_numeric#Erlang
is_numeric(L) ->
  S = trim(L,""),
  Float = (catch erlang:list_to_float(  S)),
  Int   = (catch erlang:list_to_integer(S)),
  is_number(Float) orelse is_number(Int).

trim([],A)->A;
trim([32|T],A)->trim(T,A);
trim([H|T],A)->trim(T,A++[H]).

process_csv(L) ->
  [format(L)].

format([_ | T]) ->
  format(T, header()).
format([H | T], End) ->
  NewList = End ++ process(H, length(H)),
  format(T, NewList);
format([], End) ->
  End.

process(List, Length) -> %Appending for required format
  if
    Length > 6 -> appendLong(List,lists:nthtail(6, List), is_numeric(lists:nth(7, List)));
    Length < 6 -> lists:nth(1, List) ++ "=[" ++ lists:nth(2, List) ++"," ++ appendEnd(lists:nthtail(2, List)) ++ "];\n";
    Length == 6 -> lists:nth(1, List) ++ "=[\"" ++ lists:nth(2, List) ++ "\"," ++ lists:nth(3, List) ++ "," ++ lists:nth(4, List) ++
      "," ++ lists:nth(5, List) ++ "," ++ lists:nth(6, List) ++ ",[]];\n"
  end.

appendLong(List,[_|T], IsNumeric) when IsNumeric == true -> %Appends solar system correctly
  lists:nth(1,List) ++ "=[\"" ++ lists:nth(2,List) ++ "\"," ++ lists:nth(3, List) ++
  "," ++ lists:nth(4, List) ++ "," ++ lists:nth(5,List) ++ "," ++ lists:nth(6,List) ++
  "," ++ appendEnd(T) ++ "];\n";
appendLong(List, T, IsNumeric) when IsNumeric == false -> %Appends lists correctly when Length = 7 or 8
  lists:nth(1, List) ++ "=[\"" ++ lists:nth(2,List) ++ "\"," ++ lists:nth(3,List) ++
  "," ++ lists:nth(4, List) ++ "," ++ lists:nth(5, List) ++ "," ++ lists:nth(6, List) ++
  ",[" ++ appendEnd(T) ++ "]];\n". %Appends other longer lists (>6 elements)

appendEnd([H|T]) -> %Recursively appends tail
  End = "",
  New = End ++ H,
  appendEnd(T,New).
appendEnd([H|T],End) ->
  New = End ++ "," ++ H,
  appendEnd(T, New);
appendEnd([],End) ->
  End.
%header(List) -> "//" ++ appendEnd(List) ++ "\n".
header() -> "". %Auto grader doesn't want a header..


