import React from 'react'
import styled from 'styled-components';
import { Fonts } from '../../../Constants';
import { AbsoluteFill, Flex } from '../../../Styled/Generic';
import { TriviaFileSystem } from '../../../System';
import TinyTrivia from './TinyTrivia';
import { TriviaSummarySlice } from './slice';
import TriviaStat from './TriviaStat';

const TriviaSummray = () => {
  const [state, dispatch] = React.useReducer(TriviaSummarySlice.reducer, TriviaSummarySlice.initialState);

  React.useEffect(() => {
    // TriviaFileSystem.clearAll();
    initialize();
  }, [])

  function loadNextFailedQuestion() {
    setTimeout(() => {
      if (state.currentFailed.index < state.failedTrivias.length - 1) {
        dispatch(TriviaSummarySlice.actions.setFailedIndex(state.currentFailed.index + 1));
      } else {
        dispatch(TriviaSummarySlice.actions.setOvercameFailure(true))
      }
    }, 1000)
  }

  function onPressChoice(choice: string) {
    const curTrivia = state.currentFailed.trivia;
    if (state.currentFailed.chosen === undefined) {
      dispatch(TriviaSummarySlice.actions.submitForFailed(choice));
      loadNextFailedQuestion();

      const api = choice === curTrivia?.correct_answer ? "countSuccess" : "countFail";
      TriviaFileSystem[api]().then((score) => {
        dispatch(TriviaSummarySlice.actions.setTriviaScore(score));
      });

      if (curTrivia?.correct_answer === choice) {
        dispatch(TriviaSummarySlice.actions.setOvercomeCount(state.overcomeCount + 1));
      }

      if (choice === curTrivia?.correct_answer) {
        TriviaFileSystem.removeFailedTrivia(curTrivia.question);
      }
    }
  }

  function initialize() {
    dispatch(TriviaSummarySlice.actions.setOvercomeCount(0));
    dispatch(TriviaSummarySlice.actions.setOvercameFailure(false));

    TriviaFileSystem.getFailedTrivias().then((answers) => {
      dispatch(TriviaSummarySlice.actions.setFailedTrivias(Object.values(answers).reverse()));
      dispatch(TriviaSummarySlice.actions.setFailedIndex(0));
    });

    TriviaFileSystem.getTriviaScore().then((score) => {
      dispatch(TriviaSummarySlice.actions.setTriviaScore(score))
    });
  }

  return (
    <Container data-testid={"trivia-summary"}>
      <SubTitle>정답률 및 오답률</SubTitle>
      <TriviaStat {...state.triviaScore} />
      {(state.currentFailed.trivia) && (
        <WrongTriviaContainer>
          <SubTitle>
            최근에 <span style={{ color: "red" }}>틀린</span> 문제 ({state.currentFailed.index + 1} / {state.failedTrivias.length})
          </SubTitle>
          <div style={{ position: "relative" }}>
            <TinyTrivia
              onPressChoice={onPressChoice}
              chosen={state.currentFailed.chosen}
              answers={state.currentFailed.answers}
              {...state.currentFailed.trivia}
            />
            {state.overcameFailure && (
              <AbsoluteFill
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.7)"
                }}>
                <Button
                  children={state.overcomeCount === state.failedTrivias.length ? "완료" : "다시 풀기"}
                  onClick={initialize}
                />
              </AbsoluteFill>
            )}
          </div>
        </WrongTriviaContainer>
      )}
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  padding: 1rem;
  padding-top: 2rem;
  user-select: none;
`;

const WrongTriviaContainer = styled.div`
  margin-bottom: 3rem;
  margin-top: 4rem;
`;

const SubTitle = styled.div`
  font-family: ${Fonts.어그로체L};
  font-size: 1rem;
  margin-left: 1.5rem;
  margin-bottom: 0.3rem;
  color: black;
`;

const Button = styled.button`
  outline: none;
  border: none;
  background-color: blue;
  cursor: pointer;
  padding: 1rem;
  color: white;
  font-size: 1rem;
  font-family: ${Fonts.어그로체B};
  border-radius: 1rem;
  box-shadow: 0 0.8rem 2rem 0 rgba(0,0,0,0.2);
  
  &:hover { background-color: navy; }
  &:active { background-color: blueviolet; }
`;


export default TriviaSummray
